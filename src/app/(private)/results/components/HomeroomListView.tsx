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

  // 使用されている曜日を抽出（availableな曜日だけ）
  const availableDays = useMemo(
    () => getAvailableDays(timetableResult.timetableEntries),
    [timetableResult.timetableEntries]
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

  // 列ヘッダーを生成（availableな曜日×時限）
  const columnHeaders = useMemo(() => {
    const headers: Array<{ day: string; period: number; label: string }> = []
    for (const day of availableDays) {
      for (let period = 1; period <= maxPeriod; period++) {
        headers.push({
          day,
          period,
          label: `${DAY_OF_WEEK_MAP[day]}${period}`,
        })
      }
    }
    return headers
  }, [availableDays, maxPeriod])

  return (
    <div className={styles.timetablesSection}>
      <div className={`${styles.homeroomTimetable} ${styles.homeroomListView}`}>
        <table className={styles.timetableTable}>
          <thead>
            <tr>
              <th className={styles.headerCell}></th>
              {columnHeaders.map((header, index) => (
                <th
                  key={`${header.day}-${header.period}`}
                  className={styles.headerCell}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedHomerooms.map(([homeroomId, group]) => (
              <tr key={homeroomId}>
                <td
                  className={`${styles.periodCell} ${styles.homeroomNameCell}`}
                >
                  <div>{group.homeroomName}</div>
                </td>
                {columnHeaders.map(header => {
                  const entry = group.entries.get(
                    `${header.day}-${header.period}`
                  )
                  return (
                    <td
                      key={`${header.day}-${header.period}`}
                      className={styles.cell}
                    >
                      {entry ? (
                        <div className={styles.entry}>
                          <div className={styles.courseName}>
                            {entry.course.courseName}
                          </div>
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
                                    entry.course.courseDetails.map(detail =>
                                      detail.room ? detail.room.roomName : '*'
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
