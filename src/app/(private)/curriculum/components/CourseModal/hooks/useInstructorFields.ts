import { useCallback } from 'react'
import type {
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFieldArrayReplace,
  UseFormSetValue,
} from 'react-hook-form'
import type { CourseFormValues } from '../types'

type CourseDetailRow = { instructorId: string }

interface UseInstructorFieldsArgs {
  courseDetailsValue: CourseFormValues['courseDetails']
  append: UseFieldArrayAppend<CourseFormValues, 'courseDetails'>
  remove: UseFieldArrayRemove
  replace: UseFieldArrayReplace<CourseFormValues, 'courseDetails'>
  setValue: UseFormSetValue<CourseFormValues>
}

export function useInstructorFields({
  courseDetailsValue,
  append,
  remove,
  replace,
  setValue,
}: UseInstructorFieldsArgs) {
  const addInstructorField = useCallback(() => {
    append({ instructorId: '' })
  }, [append])

  const removeInstructorField = useCallback(
    (index: number) => {
      if (courseDetailsValue.length <= 1) {
        setValue('courseDetails.0.instructorId', '', { shouldValidate: true })
        return
      }
      remove(index)
    },
    [courseDetailsValue.length, remove, setValue]
  )

  const updateInstructorField = useCallback(
    (index: number, instructorId: string) => {
      setValue(`courseDetails.${index}.instructorId`, instructorId, {
        shouldValidate: true,
      })
    },
    [setValue]
  )

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
