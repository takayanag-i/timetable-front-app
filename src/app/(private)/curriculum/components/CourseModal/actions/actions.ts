'use server'

import { Course } from '@/core/domain/entity'
import { ActionResult } from '@/types/server-action-types'
import {
  CourseModalOptions,
  UISubjectType,
  UIInstructorType,
} from '@/types/ui-types'
import type {
  GraphQLSubjectType,
  GraphQLInstructorType,
} from '@/lib/graphql/types'
import { errorResult, successResult } from '@/lib/action-helpers'
import {
  executeGraphQLForServerAction,
  executeGraphQLMutation,
  getDefaultTtid,
} from '@/lib/graphql-client'
import {
  GET_LANES,
  GET_COURSE_WITH_SUBJECT,
  GET_COURSE_MODAL_OPTIONS,
} from '@/lib/graphql/queries'
import { UPSERT_COURSES, UPSERT_LANES } from '@/lib/graphql/mutations'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

// 講座モーダルオプション取得用の複合レスポンス型（GraphQL型）
interface CourseModalOptionsResponse {
  subjects: GraphQLSubjectType[]
  instructors: GraphQLInstructorType[]
  courses: Array<
    Course & {
      subject?: {
        id: string
        subjectName: string | null
        grade?: { id: string; gradeName: string }
        discipline?: { disciplineCode: string; disciplineName: string }
      }
    }
  >
}

/**
 * 講座作成に必要なデータ（科目・教員・講座一覧）を取得するServer Action
 * 1回のGraphQLリクエストで全データを取得（リクエスト数削減によるパフォーマンス向上）
 */
export async function fetchCourseModalOptions(
  _prevState: ActionResult<CourseModalOptions> | null
): Promise<ActionResult<CourseModalOptions>> {
  try {
    const ttid = getDefaultTtid()

    // 科目・教員・講座を1回のリクエストで取得（リクエスト数削減）
    const result =
      await executeGraphQLForServerAction<CourseModalOptionsResponse>(
        {
          query: GET_COURSE_MODAL_OPTIONS,
          variables: {
            ttid,
            coursesInput: { ttid },
          },
        },
        undefined // 複数フィールドを取得するため、dataFieldNameは指定しない
      )

    if (!result.success || !result.data) {
      return errorResult(
        `講座フォームデータの取得に失敗しました: ${result.error || '不明なエラー'}`
      )
    }

    const { subjects, instructors, courses } = result.data

    if (!subjects) {
      return errorResult('科目データの取得に失敗しました')
    }

    if (!instructors) {
      return errorResult('教員データの取得に失敗しました')
    }

    // GraphQL型からUI型に変換
    const uiSubjects: UISubjectType[] = subjects.map(subject => ({
      id: subject.id,
      subjectName: subject.subjectName,
      credits: subject.credits,
      discipline: subject.discipline,
      grade: subject.grade,
    }))

    const uiInstructors: UIInstructorType[] = instructors.map(instructor => ({
      id: instructor.id,
      instructorName: instructor.instructorName,
      disciplineCode: instructor.disciplineCode,
      attendanceDays: instructor.attendanceDays.map(ad => ({
        id: ad.id,
        dayOfWeek: ad.dayOfWeek,
        unavailablePeriods: ad.unavailablePeriods,
      })),
    }))

    // 講座データの正規化
    let normalizedCourses: {
      id: string
      courseName: string
      subjectId: string
      instructorIds: string[]
      instructorNames: string[]
    }[] = []

    if (courses) {
      normalizedCourses = courses
        .filter(course => course.subject?.id)
        .map(course => ({
          id: course.id,
          courseName: course.courseName,
          subjectId: course.subject!.id,
          instructorIds: course.courseDetails
            .map(detail => detail.instructor?.id)
            .filter((id): id is string => Boolean(id)),
          instructorNames: course.courseDetails
            .map(detail => detail.instructor?.instructorName)
            .filter((name): name is string => Boolean(name)),
        }))
    } else {
      logger.warn(
        'Course data not found, existing courses will not be displayed'
      )
    }

    return successResult({
      subjects: uiSubjects,
      instructors: uiInstructors,
      courses: normalizedCourses,
    })
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching course form data', appError)
    return errorResult(appError)
  }
}

/**
 * 講座の詳細情報を取得するServer Action（編集用）
 */
export async function fetchCourseDetails(
  _prevState: ActionResult<
    Course & { subject: { id: string; subjectName: string } }
  > | null,
  formData: FormData
): Promise<
  ActionResult<Course & { subject: { id: string; subjectName: string } }>
> {
  const courseId = formData.get('courseId') as string

  console.log('DEBUG fetchCourseDetails - courseId:', courseId)

  if (!courseId) {
    return errorResult('講座IDが指定されていません')
  }

  try {
    const result = await executeGraphQLForServerAction<
      Array<Course & { subject: { id: string; subjectName: string } }>
    >(
      {
        query: GET_COURSE_WITH_SUBJECT,
        variables: {
          input: {
            id: courseId,
          },
        },
      },
      'courses'
    )

    if (!result.success || !result.data || result.data.length === 0) {
      return errorResult(
        `講座情報の取得に失敗しました: ${result.error || '講座が見つかりませんでした'}`
      )
    }

    console.log('DEBUG - Fetched course details:', result.data)

    return successResult(result.data[0])
  } catch (error) {
    console.error('Error fetching course details:', error)
    return errorResult(
      error instanceof Error ? error.message : '講座詳細の取得に失敗しました'
    )
  }
}

/**
 * 講座を作成してレーンに追加するServer Action
 */
export async function createCourseAndAddToLane(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const subjectId = formData.get('subjectId') as string
  const courseName = formData.get('courseName') as string
  const instructorIds = Array.from(
    new Set(
      formData
        .getAll('instructorIds')
        .map(value => (typeof value === 'string' ? value.trim() : ''))
        .filter((value): value is string => value.length > 0)
    )
  )
  const selectedCourseIdRaw = formData.get('selectedCourseId')
  const laneId = formData.get('laneId') as string
  const selectedCourseId =
    typeof selectedCourseIdRaw === 'string' ? selectedCourseIdRaw.trim() : ''

  console.log('DEBUG createCourseAndAddToLane - Received:', {
    subjectId,
    courseName,
    instructorIds,
    laneId,
    selectedCourseId,
  })

  if (!laneId) {
    return errorResult('レーンが選択されていません')
  }

  const addCourseToLane = async (courseId: string, message: string) => {
    const lanesResult = await executeGraphQLForServerAction<
      Array<{ id: string; courses: Array<{ id: string }> }>
    >(
      {
        query: GET_LANES,
        variables: {
          input: {
            id: laneId,
          },
        },
      },
      'lanes'
    )

    if (
      !lanesResult.success ||
      !lanesResult.data ||
      lanesResult.data.length === 0
    ) {
      return errorResult(
        `レーン情報の取得に失敗しました: ${lanesResult.error || '不明なエラー'}`
      )
    }

    const existingCourseIds = lanesResult.data[0].courses.map(
      course => course.id
    )

    if (existingCourseIds.includes(courseId)) {
      return errorResult('選択した講座は既にこのレーンに存在します')
    }

    const updatedLanesResult = await executeGraphQLMutation<
      Array<{ id: string }>
    >(
      {
        query: UPSERT_LANES,
        variables: {
          input: {
            lanes: [
              {
                id: laneId,
                courseIds: [...existingCourseIds, courseId],
              },
            ],
            by: 'system',
          },
        },
      },
      'upsertLanes'
    )

    if (!updatedLanesResult.success || !updatedLanesResult.data) {
      return errorResult(
        `レーンの更新に失敗しました: ${updatedLanesResult.error || '不明なエラー'}`
      )
    }

    console.log('DEBUG - Updated lanes:', updatedLanesResult.data)

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult({ message })
  }

  if (selectedCourseId) {
    return addCourseToLane(selectedCourseId, '既存の講座をレーンに追加しました')
  }

  if (!subjectId || !courseName || instructorIds.length === 0) {
    return errorResult('すべての項目を入力してください')
  }

  try {
    // 1. 講座を作成（GraphQLから直接）
    const coursesResult = await executeGraphQLMutation<
      Array<{ id: string; courseName: string }>
    >(
      {
        query: UPSERT_COURSES,
        variables: {
          input: {
            courses: [
              {
                subjectId,
                courseName,
                courseDetails: instructorIds.map(id => ({ instructorId: id })),
              },
            ],
            by: 'system',
          },
        },
      },
      'upsertCourses'
    )

    if (
      !coursesResult.success ||
      !coursesResult.data ||
      coursesResult.data.length === 0
    ) {
      return errorResult(
        `講座の作成に失敗しました: ${coursesResult.error || '不明なエラー'}`
      )
    }

    const newCourseId = coursesResult.data[0].id

    console.log('DEBUG - Created course:', { newCourseId })

    // 2. レーンを更新（新講座を追加）
    return addCourseToLane(newCourseId, '講座を作成しレーンに追加しました')
  } catch (error) {
    console.error('Error creating course and adding to lane:', error)
    return errorResult(
      error instanceof Error ? error.message : '講座の作成・追加に失敗しました'
    )
  }
}

/**
 * 講座を更新するServer Action
 */
export async function updateCourse(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const courseId = formData.get('courseId') as string
  const subjectId = formData.get('subjectId') as string
  const courseName = formData.get('courseName') as string
  const instructorIds = Array.from(
    new Set(
      formData
        .getAll('instructorIds')
        .map(value => (typeof value === 'string' ? value.trim() : ''))
        .filter((value): value is string => value.length > 0)
    )
  )

  console.log('DEBUG updateCourse - Received:', {
    courseId,
    subjectId,
    courseName,
    instructorIds,
  })

  if (!courseId || !subjectId || !courseName || instructorIds.length === 0) {
    return errorResult('すべての項目を入力してください')
  }

  try {
    // 講座を更新（既存のIDを使用）
    const result = await executeGraphQLMutation<
      Array<{ id: string; courseName: string }>
    >(
      {
        query: UPSERT_COURSES,
        variables: {
          input: {
            courses: [
              {
                id: courseId,
                subjectId,
                courseName,
                courseDetails: instructorIds.map(id => ({ instructorId: id })),
              },
            ],
            by: 'system',
          },
        },
      },
      'upsertCourses'
    )

    if (!result.success || !result.data || result.data.length === 0) {
      return errorResult(
        `講座の更新に失敗しました: ${result.error || '不明なエラー'}`
      )
    }

    console.log('DEBUG - Updated course:', { courseId })

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult({ message: '講座を更新しました' })
  } catch (error) {
    console.error('Error updating course:', error)
    return errorResult(
      error instanceof Error ? error.message : '講座の更新に失敗しました'
    )
  }
}

/**
 * レーンから講座を削除するServer Action
 */
export async function removeCourseFromLane(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const laneId = formData.get('laneId') as string
  const courseId = formData.get('courseId') as string

  console.log('DEBUG removeCourseFromLane - Received:', {
    laneId,
    courseId,
  })

  if (!laneId || !courseId) {
    return errorResult('レーンIDと講座IDが必要です')
  }

  try {
    // 1. 既存のレーン情報を取得
    const lanesResult = await executeGraphQLForServerAction<
      Array<{ id: string; courses: Array<{ id: string }> }>
    >(
      {
        query: GET_LANES,
        variables: {
          input: {
            id: laneId,
          },
        },
      },
      'lanes'
    )

    if (
      !lanesResult.success ||
      !lanesResult.data ||
      lanesResult.data.length === 0
    ) {
      return errorResult(
        `レーン情報の取得に失敗しました: ${lanesResult.error || '不明なエラー'}`
      )
    }

    const existingCourseIds = lanesResult.data[0].courses.map(
      course => course.id
    )

    // 2. 指定された講座を除外
    const updatedCourseIds = existingCourseIds.filter(id => id !== courseId)

    console.log('DEBUG - Removing course:', {
      existingCourseIds,
      updatedCourseIds,
      removedCourseId: courseId,
    })

    // 3. レーンを更新（講座を削除）
    const updatedLanesResult = await executeGraphQLMutation<
      Array<{ id: string }>
    >(
      {
        query: UPSERT_LANES,
        variables: {
          input: {
            lanes: [
              {
                id: laneId,
                courseIds: updatedCourseIds,
              },
            ],
            by: 'system',
          },
        },
      },
      'upsertLanes'
    )

    if (!updatedLanesResult.success || !updatedLanesResult.data) {
      return errorResult(
        `レーンの更新に失敗しました: ${updatedLanesResult.error || '不明なエラー'}`
      )
    }

    console.log('DEBUG - Updated lanes after removal:', updatedLanesResult.data)

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult({ message: 'レーンから講座を削除しました' })
  } catch (error) {
    console.error('Error removing course from lane:', error)
    return errorResult(
      error instanceof Error ? error.message : 'レーンからの削除に失敗しました'
    )
  }
}
