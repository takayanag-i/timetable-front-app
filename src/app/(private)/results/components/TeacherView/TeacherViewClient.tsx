'use client'

import styles from '../TimetableResultUi.module.css'
import type { TeacherViewData } from './types'

interface TeacherViewClientProps {
  data: TeacherViewData
}

/**
 * 教員ビュー - 表示専用Client Component
 */
export default function TeacherViewClient({ data }: TeacherViewClientProps) {
  const { teachers, availableDays, periods } = data

  return (
    <div className={styles.timetablesSection}>
      {teachers.map(teacher => (
        <div key={teacher.instructorId} className={styles.homeroomTimetable}>
          <h2 className={styles.homeroomTitle}>{teacher.instructorName}</h2>
          <table className={styles.timetableTable}>
            <thead>
              <tr>
                <th className={styles.headerCell}>時限</th>
                {availableDays.map(day => (
                  <th key={day.key} className={styles.headerCell}>
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map(period => (
                <tr key={period}>
                  <td className={styles.periodCell}>{period}</td>
                  {availableDays.map(day => {
                    const cell = teacher.cells[`${day.key}-${period}`]
                    return (
                      <td key={day.key} className={styles.cell}>
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
      ))}
    </div>
  )
}
