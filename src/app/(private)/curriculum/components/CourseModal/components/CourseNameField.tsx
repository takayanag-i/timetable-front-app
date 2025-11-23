import Input from '@/components/shared/Input'
import type { CourseModalOptions } from '@/types/ui-types'
import styles from '../CourseModal.module.css'

interface CourseNameFieldProps {
  value: string
  onChange: (value: string) => void
  onFocus: () => void
  onBlur: () => void
  isSuggestionVisible: boolean
  suggestions: CourseModalOptions['courses']
  onSelectSuggestion: (course: CourseModalOptions['courses'][number]) => void
  showNoExistingCoursesMessage?: boolean
}

export function CourseNameField({
  value,
  onChange,
  onFocus,
  onBlur,
  isSuggestionVisible,
  suggestions,
  onSelectSuggestion,
  showNoExistingCoursesMessage,
}: CourseNameFieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.courseNameWrapper}>
        <Input
          id="courseName"
          label="講座名 *"
          value={value}
          onValueChange={onChange}
          placeholder="例: 数学Ⅰ基礎"
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="off"
        />
        {isSuggestionVisible && suggestions.length > 0 && (
          <div className={styles.suggestionList}>
            {suggestions.map(course => (
              <button
                key={course.id}
                type="button"
                className={styles.suggestionItem}
                onMouseDown={event => {
                  event.preventDefault()
                  onSelectSuggestion(course)
                }}
              >
                <span className={styles.suggestionName}>
                  {course.courseName}
                </span>
                {course.instructorNames.length > 0 && (
                  <span className={styles.suggestionMeta}>
                    {course.instructorNames.join(', ')}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {(showNoExistingCoursesMessage ?? false) && (
        <p className={styles.helperText}>
          選択した科目には既存講座が登録されていません。新規講座を作成してください。
        </p>
      )}
    </div>
  )
}
