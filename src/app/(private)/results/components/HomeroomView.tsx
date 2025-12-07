'use client'

import { useMemo } from 'react'
import type { TimetableResult } from '@/types/graphql-types'
import { calculateMaxPeriod } from '../utils/timetable-utils'
import styles from './TimetableResultUi.module.css'

// 英語形式の曜日配列（データ処理用）
const ENGLISH_DAYS_OF_WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
// 英語→日本語の変換マップ（表示用）
const DAY_OF_WEEK_MAP: Record<string, string> = {
  mon: '月',
  tue: '火',
  wed: '水',
  thu: '木',
  fri: '金',
  sat: '土',
  sun: '日',
}

interface HomeroomViewProps {
  timetableResult: TimetableResult
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
        entries: Map<string, TimetableResult['timetableEntries'][0]>
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
                <th className={styles.headerCell}>時限</th>
                {ENGLISH_DAYS_OF_WEEK.map(day => (
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
                    {ENGLISH_DAYS_OF_WEEK.map(day => {
                      const entry = group.entries.get(`${day}-${period}`)
                      return (
                        <td key={day} className={styles.cell}>
                          {entry ? (
                            <div className={styles.entry}>
                              <div className={styles.courseName}>
                                {entry.course.courseName}
                              </div>
                              {entry.course.subject && (
                                <div className={styles.subjectName}>
                                  {entry.course.subject.subjectName}
                                </div>
                              )}
                              {entry.course.courseDetails &&
                                entry.course.courseDetails.length > 0 && (
                                  <div className={styles.details}>
                                    {entry.course.courseDetails[0]
                                      .instructor && (
                                      <span className={styles.instructor}>
                                        教員:
                                        {
                                          entry.course.courseDetails[0]
                                            .instructor.instructorName
                                        }
                                      </span>
                                    )}
                                    {entry.course.courseDetails[0].room && (
                                      <span className={styles.room}>
                                        教室:
                                        {
                                          entry.course.courseDetails[0].room
                                            .roomName
                                        }
                                      </span>
                                    )}
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
