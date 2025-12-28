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
import { GET_COURSE_MODAL_OPTIONS } from '@/app/(private)/curriculum/graphql/queries'
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
          query: GET_COURSE_MODAL_OPTIONS,
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
    const courseModalSubjects: CourseModalSubject[] = subjects
      ? subjects.map(subject => ({
          id: subject.id,
          subjectName: subject.subjectName,
          credits: subject.credits,
          discipline: subject.discipline,
          grade: subject.grade,
        }))
      : []

    const courseModalInstructors: CourseModalInstructor[] = instructors
      ? instructors.map(instructor => ({
          id: instructor.id,
          instructorName: instructor.instructorName,
          disciplineCode: instructor.disciplineCode,
        }))
      : []

    const courseModalCourses: CourseModalCourse[] = courses
      ? courses
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
      : []

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
