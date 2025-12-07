'use client'

import { useMemo } from 'react'
import type { TimetableResultType } from '@/lib/graphql/types'
import { calculateMaxPeriod } from '../utils/timetable-utils'
import styles from './TimetableResultUi.module.css'

// 英語形式の曜日配列（月曜日から金曜日まで）
const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri']
// 英語→日本語の変換マップ（表示用）
const DAY_OF_WEEK_MAP: Record<string, string> = {
  mon: '月',
  tue: '火',
  wed: '水',
  thu: '木',
  fri: '金',
}

interface HomeroomListViewProps {
  timetableResult: TimetableResultType
}

/**
 * 学級一覧ビュー - 月1時限から金の最後の時限まで横に並べ、学級を縦に並べる
 */
export default function HomeroomListView({
  timetableResult,
}: HomeroomListViewProps) {
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

  // 学級名でソート
  const sortedHomerooms = useMemo(() => {
    return Array.from(timetableByHomeroom.entries()).sort(([, a], [, b]) => {
      // 学年名で比較
      if (a.gradeName && b.gradeName) {
        const gradeCompare = a.gradeName.localeCompare(b.gradeName, 'ja')
        if (gradeCompare !== 0) return gradeCompare
      }
      // 学級名で比較
      return a.homeroomName.localeCompare(b.homeroomName, 'ja')
    })
  }, [timetableByHomeroom])

  // 列ヘッダーを生成（月1時限、月2時限、...、金の最後の時限）
  const columnHeaders = useMemo(() => {
    const headers: Array<{ day: string; period: number; label: string }> = []
    for (const day of WEEKDAYS) {
      for (let period = 1; period <= maxPeriod; period++) {
        headers.push({
          day,
          period,
          label: `${DAY_OF_WEEK_MAP[day]}${period}`,
        })
      }
    }
    return headers
  }, [maxPeriod])

  return (
    <div className={styles.timetablesSection}>
      <div className={styles.homeroomTimetable}>
        <table className={styles.timetableTable}>
          <thead>
            <tr>
              <th className={styles.headerCell}>学級</th>
              {columnHeaders.map((header, index) => (
                <th key={`${header.day}-${header.period}`} className={styles.headerCell}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedHomerooms.map(([homeroomId, group]) => (
              <tr key={homeroomId}>
                <td className={`${styles.periodCell} ${styles.homeroomNameCell}`}>
                  <div>{group.homeroomName}</div>
                  {group.gradeName && (
                    <div className={styles.gradeName}>({group.gradeName})</div>
                  )}
                </td>
                {columnHeaders.map(header => {
                  const entry = group.entries.get(
                    `${header.day}-${header.period}`
                  )
                  return (
                    <td key={`${header.day}-${header.period}`} className={styles.cell}>
                      {entry ? (
                        <div className={styles.entry}>
                          {entry.course.subject && (
                            <div className={styles.subjectName}>
                              {entry.course.subject.subjectName}
                            </div>
                          )}
                          <div className={styles.courseName}>
                            {entry.course.courseName}
                          </div>
                          {entry.course.courseDetails &&
                            entry.course.courseDetails.length > 0 && (
                              <div className={styles.details}>
                                {entry.course.courseDetails[0].instructor && (
                                  <span className={styles.instructor}>
                                    {
                                      entry.course.courseDetails[0]
                                        .instructor.instructorName
                                    }
                                  </span>
                                )}
                                <span className={styles.room}>
                                  {entry.course.courseDetails[0].room
                                    ? entry.course.courseDetails[0].room.roomName
                                    : '*'}
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
    </div>
  )
}

