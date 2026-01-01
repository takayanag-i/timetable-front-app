'use server'

import { ActionResult } from '@/types/server-action-types'
import {
  CourseModalOptions,
  CourseModalSubject,
  CourseModalInstructor,
  CourseModalCourse,
} from '@/app/(private)/curriculum/components/CourseModal/types'
import type { CourseModalOptionsResponse } from '@/app/(private)/curriculum/graphql/types'
import { errorResult, successResult } from '@/lib/action-helpers'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { FETCH_COURSE_MODAL_OPTIONS } from '@/app/(private)/curriculum/graphql/queries'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * 講座モーダルの表示オプション（科目・教員・講座一覧）を取得するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @returns 講座モーダルオプションの取得結果
 */
export async function fetchCourseModalOptions(
  _prevState: ActionResult<CourseModalOptions> | null
): Promise<ActionResult<CourseModalOptions>> {
  try {
    const ttid = getDefaultTtid()

    // 科目・教員・講座を取得
    const result =
      await executeGraphQLForServerAction<CourseModalOptionsResponse>(
        {
          query: FETCH_COURSE_MODAL_OPTIONS,
          variables: {
            subjectsInput: { ttid },
            instructorsInput: { ttid },
            coursesInput: { ttid },
          },
        },
        undefined
      )

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error(appError.getMessage())

      return errorResult(appError)
    }

    const { subjects, instructors, courses } = result.data

    // GraphQL型からCourseModalの型に変換する
    const courseModalSubjects: CourseModalSubject[] = (subjects || []).map(
      subject => {
        if (!subject.id) {
          throw new Error('科目IDが取得できませんでした')
        }
        if (!subject.subjectName) {
          throw new Error('科目名が取得できませんでした')
        }

        return {
          id: subject.id,
          subjectName: subject.subjectName,
          discipline: subject.discipline
            ? (() => {
                if (!subject.discipline.disciplineCode) {
                  throw new Error('教科コードが取得できませんでした')
                }
                if (!subject.discipline.disciplineName) {
                  throw new Error('教科名が取得できませんでした')
                }
                return {
                  disciplineCode: subject.discipline.disciplineCode,
                  disciplineName: subject.discipline.disciplineName,
                }
              })()
            : null,
          grade: subject.grade
            ? (() => {
                if (!subject.grade.id) {
                  throw new Error('学年IDが取得できませんでした')
                }
                if (!subject.grade.gradeName) {
                  throw new Error('学年名が取得できませんでした')
                }
                return {
                  id: subject.grade.id,
                  gradeName: subject.grade.gradeName,
                }
              })()
            : null,
        }
      }
    )

    const courseModalInstructors: CourseModalInstructor[] = (
      instructors || []
    ).map(instructor => {
      if (!instructor.id) {
        throw new Error('教員IDが取得できませんでした')
      }
      if (!instructor.instructorName) {
        throw new Error('教員名が取得できませんでした')
      }
      if (!instructor.disciplineCode) {
        throw new Error('教科コードが取得できませんでした')
      }

      return {
        id: instructor.id,
        instructorName: instructor.instructorName,
        disciplineCode: instructor.disciplineCode,
      }
    })

    const courseModalCourses: CourseModalCourse[] = (courses || [])
      .filter(course => {
        if (!course.id) {
          throw new Error('講座IDが取得できませんでした')
        }
        if (!course.courseName) {
          throw new Error('講座名が取得できませんでした')
        }
        if (!course.subject?.id) {
          return false
        }
        return true
      })
      .map(course => {
        if (!course.subject) {
          throw new Error('科目情報が取得できませんでした')
        }
        if (!course.subject.id) {
          throw new Error('科目IDが取得できませんでした')
        }

        return {
          id: course.id!,
          courseName: course.courseName!,
          subjectId: course.subject.id,
          instructorIds: (course.courseDetails || [])
            .map(detail => {
              if (!detail.instructor?.id) {
                return null
              }
              return detail.instructor.id
            })
            .filter((id): id is string => id !== null),
          instructorNames: (course.courseDetails || [])
            .map(detail => {
              if (!detail.instructor?.instructorName) {
                return null
              }
              return detail.instructor.instructorName
            })
            .filter((name): name is string => name !== null),
        }
      })

    return successResult({
      subjects: courseModalSubjects,
      instructors: courseModalInstructors,
      courses: courseModalCourses,
    })
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error(appError.getMessage())

    return errorResult(appError)
  }
}
