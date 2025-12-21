'use client'

import styles from '../TimetableResultUi.module.css'
import type { InstructorViewData } from './types'

interface InstructorViewClientProps {
  data: InstructorViewData
}

/**
 * 教員ビュー - 表示専用Client Component
 */
export default function InstructorViewClient({
  data,
}: InstructorViewClientProps) {
  const { instructors, columnHeaders, rowHeaders } = data

  return (
    <div className={styles.timetablesSection}>
      {instructors.map(instructor => (
        <div key={instructor.instructorId} className={styles.homeroomTimetable}>
          <h2 className={styles.homeroomTitle}>{instructor.instructorName}</h2>
          <table className={styles.timetableTable}>
            <thead>
              <tr>
                <th className={styles.headerCell}>時限</th>
                {columnHeaders.map(header => (
                  <th key={header.key} className={styles.headerCell}>
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowHeaders.map(period => (
                <tr key={period}>
                  <td className={styles.periodCell}>{period}</td>
                  {columnHeaders.map(header => {
                    const cell = instructor.cells[`${header.key}-${period}`]
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
      ))}
    </div>
  )
}
