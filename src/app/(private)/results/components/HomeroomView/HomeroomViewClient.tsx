'use client'

import styles from '../TimetableResultUi.module.css'
import type { HomeroomViewData } from './types'

interface HomeroomViewClientProps {
  data: HomeroomViewData
}

/**
 * 学級ビュー - 学級ごとに時間割を表示（表示専用Client Component）
 */
export default function HomeroomViewClient({ data }: HomeroomViewClientProps) {
  const { homerooms, availableDays, periods } = data

  return (
    <div className={styles.timetablesSection}>
      {homerooms.map(homeroom => (
        <div key={homeroom.homeroomId} className={styles.homeroomTimetable}>
          <h2 className={styles.homeroomTitle}>
            {homeroom.homeroomName}
            {homeroom.gradeName && (
              <span className={styles.gradeName}>({homeroom.gradeName})</span>
            )}
          </h2>
          <table className={styles.timetableTable}>
            <thead>
              <tr>
                <th className={styles.headerCell}></th>
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
                    const cell = homeroom.cells[`${day.key}-${period}`]
                    return (
                      <td key={day.key} className={styles.cell}>
                        {cell ? (
                          <div className={styles.entry}>
                            {cell.subjectName && (
                              <div className={styles.subjectName}>
                                {cell.subjectName}
                              </div>
                            )}
                            {(cell.instructorText || cell.roomText) && (
                              <div className={styles.details}>
                                <span className={styles.instructor}>
                                  {cell.instructorText}
                                </span>
                                <span className={styles.room}>
                                  {cell.roomText}
                                </span>
                              </div>
                            )}
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

