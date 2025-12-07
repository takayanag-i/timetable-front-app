'use client'

import { useMemo } from 'react'
import type { TimetableResultType } from '@/lib/graphql/types'
import {
  calculateMaxPeriod,
  DAY_OF_WEEK_MAP,
  getAvailableDays,
  truncateJoinedText,
} from '../utils/timetable-utils'
import styles from './TimetableResultUi.module.css'

interface HomeroomViewProps {
  timetableResult: TimetableResultType
}

/**
 * 学級ビュー - 学級ごとに時間割を表示
 */
export default function HomeroomView({ timetableResult }: HomeroomViewProps) {
  // 学級ごとに時間割をグループ化
  const timetableByHomeroom = useMemo(() => {
    const grouped = new Map<
      string,
      {
        homeroomName: string
        gradeName?: string
        entries: Map<string, TimetableResultType['timetableEntries'][0]>
      }
    >()

    for (const entry of timetableResult.timetableEntries) {
      const homeroomId = entry.homeroom.id
      if (!grouped.has(homeroomId)) {
        grouped.set(homeroomId, {
          homeroomName: entry.homeroom.homeroomName,
          gradeName: entry.homeroom.grade?.gradeName,
          entries: new Map(),
        })
      }

      const group = grouped.get(homeroomId)!
      const key = `${entry.dayOfWeek}-${entry.period}`
      group.entries.set(key, entry)
    }

    return grouped
  }, [timetableResult.timetableEntries])

  // 最大時限数を計算
  const maxPeriod = useMemo(
    () => calculateMaxPeriod(timetableByHomeroom),
    [timetableByHomeroom]
  )

  // 使用されている曜日を抽出（availableな曜日だけ）
  const availableDays = useMemo(
    () => getAvailableDays(timetableResult.timetableEntries),
    [timetableResult.timetableEntries]
  )

  return (
    <div className={styles.timetablesSection}>
      {Array.from(timetableByHomeroom.entries()).map(([homeroomId, group]) => (
        <div key={homeroomId} className={styles.homeroomTimetable}>
          <h2 className={styles.homeroomTitle}>
            {group.homeroomName}
            {group.gradeName && (
              <span className={styles.gradeName}>({group.gradeName})</span>
            )}
          </h2>
          <table className={styles.timetableTable}>
            <thead>
              <tr>
                <th className={styles.headerCell}></th>
                {availableDays.map(day => (
                  <th key={day} className={styles.headerCell}>
                    {DAY_OF_WEEK_MAP[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxPeriod }, (_, i) => i + 1).map(
                period => (
                  <tr key={period}>
                    <td className={styles.periodCell}>{period}</td>
                    {availableDays.map(day => {
                      const entry = group.entries.get(`${day}-${period}`)
                      return (
                        <td key={day} className={styles.cell}>
                          {entry ? (
                            <div className={styles.entry}>
                              {entry.course.subject && (
                                <div className={styles.subjectName}>
                                  {entry.course.subject.subjectName}
                                </div>
                              )}
                              {entry.course.courseDetails &&
                                entry.course.courseDetails.length > 0 && (
                                  <div className={styles.details}>
                                    <span className={styles.instructor}>
                                      {truncateJoinedText(
                                        entry.course.courseDetails
                                          .map(detail =>
                                            detail.instructor
                                              ? detail.instructor.instructorName
                                              : ''
                                          )
                                          .filter(Boolean),
                                        '/',
                                        6
                                      )}
                                    </span>
                                    <span className={styles.room}>
                                      {truncateJoinedText(
                                        entry.course.courseDetails.map(
                                          detail =>
                                            detail.room
                                              ? detail.room.roomName
                                              : '*'
                                        ),
                                        '/',
                                        6
                                      )}
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
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
