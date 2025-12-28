'use client'

import styles from '../../TimetableResultUi.module.css'
import type { HomeroomListViewData } from './types'

interface HomeroomListViewClientProps {
  data: HomeroomListViewData
}

/**
 * 学級一覧ビュー - 表示専用Client Component
 */
export default function HomeroomListViewClient({
  data,
}: HomeroomListViewClientProps) {
  const { homerooms, columnHeaders, rowHeaders } = data

  return (
    <div className={styles.timetablesSection}>
      <div className={`${styles.homeroomTimetable} ${styles.homeroomListView}`}>
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
            {rowHeaders.map((rowHeader, index) => {
              const homeroom = homerooms[index]
              return (
                <tr key={homeroom.homeroomId}>
                  <td
                    className={`${styles.periodCell} ${styles.homeroomNameCell}`}
                  >
                    <div>{rowHeader}</div>
                  </td>
                  {columnHeaders.map(header => {
                    const cell = homeroom.cells[header.key]
                    return (
                      <td key={header.key} className={styles.cell}>
                        {cell ? (
                          <div className={styles.entry}>
                            <div className={styles.courseName}>
                              {cell.courseName}
                            </div>
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
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
