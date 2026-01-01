import { useCallback } from 'react'
import type {
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFieldArrayReplace,
  UseFormSetValue,
} from 'react-hook-form'
import type { CourseFormCourseDetail, CourseFormValues } from '../types'

interface UseInstructorFieldsArgs {
  courseDetailsValue: CourseFormCourseDetail[]
  append: UseFieldArrayAppend<CourseFormValues, 'courseDetails'>
  remove: UseFieldArrayRemove
  replace: UseFieldArrayReplace<CourseFormValues, 'courseDetails'>
  setValue: UseFormSetValue<CourseFormValues>
}

/**
 * 教員フィールドのカスタムフック
 */
export function useInstructorFields({
  courseDetailsValue,
  append,
  remove,
  replace,
  setValue,
}: UseInstructorFieldsArgs) {
  // 教員フィールドを追加する
  const addInstructorField = useCallback(() => {
    append({ instructorId: '' })
  }, [append])

  // 教員フィールドを削除する
  const removeInstructorField = useCallback(
    (index: number) => {
      if (courseDetailsValue.length <= 1) {
        // 教員フィールドが1つの場合は、削除せずにそのフィールドを空にセットする
        setValue('courseDetails.0.instructorId', '', { shouldValidate: true })
        return
      }
      remove(index)
    },
    [courseDetailsValue.length, remove, setValue]
  )

  // 教員フィールドを更新する
  const updateInstructorField = useCallback(
    (index: number, instructorId: string) => {
      setValue(`courseDetails.${index}.instructorId`, instructorId, {
        shouldValidate: true,
      })
    },
    [setValue]
  )

  // 教員フィールドをリセットする
  const resetInstructorFields = useCallback(() => {
    replace([{ instructorId: '' }])
  }, [replace])

  return {
    addInstructorField,
    removeInstructorField,
    updateInstructorField,
    resetInstructorFields,
  }
}
