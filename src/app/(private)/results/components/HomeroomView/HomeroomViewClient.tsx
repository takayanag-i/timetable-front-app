'use client'

import styles from '../TimetableResultUi.module.css'
import type { HomeroomViewData } from './types'

interface HomeroomViewClientProps {
  data: HomeroomViewData
}

/**
 * 学級ビューを返却するClient Component
 */
export default function HomeroomViewClient({ data }: HomeroomViewClientProps) {
  const { homerooms, columnHeaders, rowHeaders } = data

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
                    const cell = homeroom.cells[`${header.key}-${period}`]
                    return (
                      <td key={header.key} className={styles.cell}>
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
