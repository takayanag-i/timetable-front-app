'use client'

import styles from '../TimetableResultUi.module.css'
import type { TeacherListViewData } from './types'

interface TeacherListViewClientProps {
  data: TeacherListViewData
}

/**
 * 教員一覧ビュー - 表示専用Client Component
 */
export default function TeacherListViewClient({
  data,
}: TeacherListViewClientProps) {
  const { teachers, columnHeaders } = data

  return (
    <div className={styles.timetablesSection}>
      <div className={`${styles.homeroomTimetable} ${styles.teacherListView}`}>
        <table className={styles.timetableTable}>
          <thead>
            <tr>
              <th className={styles.headerCell}></th>
              {columnHeaders.map(header => (
                <th key={header.key} className={styles.headerCell}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher.instructorId}>
                <td
                  className={`${styles.periodCell} ${styles.homeroomNameCell}`}
                >
                  <div>{teacher.instructorName}</div>
                </td>
                {columnHeaders.map(header => {
                  const cell = teacher.cells[header.key]
                  return (
                    <td key={header.key} className={styles.cell}>
                      {cell ? (
                        <div className={styles.entry}>
                          <div className={styles.courseName}>
                            {cell.courseName}
                          </div>
                          <div className={styles.details}>
                            <span className={styles.instructor}>
                              {cell.homeroomText}
                            </span>
                            {cell.roomText && (
                              <span className={styles.room}>
                                {cell.roomText}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.emptyCell}>-</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
