'use client'

import { useMemo } from 'react'
import type { TimetableResultType } from '@/lib/graphql/types'
import {
  calculateMaxPeriodFromEntries,
  DAY_OF_WEEK_MAP,
  getAvailableDays,
  truncateJoinedText,
} from '../utils/timetable-utils'
import styles from './TimetableResultUi.module.css'

interface TeacherViewProps {
  timetableResult: TimetableResultType
}

/**
 * 教員ビュー - 教員ごとに時間割を表示
 */
export default function TeacherView({ timetableResult }: TeacherViewProps) {
  // 教員ごとに時間割をグループ化
  const timetableByTeacher = useMemo(() => {
    const grouped = new Map<
      string,
      {
        instructorName: string
        entries: Map<string, TimetableResultType['timetableEntries'][0][]>
      }
    >()

    for (const entry of timetableResult.timetableEntries) {
      // courseDetailsから教員情報を取得
      const courseDetails = entry.course.courseDetails
      if (!courseDetails || courseDetails.length === 0) {
        continue
      }

      // 複数のcourseDetailsから教員を取得
      // 同じentryが同じ教員の同じ時限に複数回追加されないように、教員IDごとに処理
      const processedInstructorIds = new Set<string>()
      for (const detail of courseDetails) {
        const instructor = detail.instructor
        if (!instructor) {
          continue
        }

        const instructorId = instructor.id
        // 同じentryが同じ教員に複数回追加されないようにチェック
        if (processedInstructorIds.has(instructorId)) {
          continue
        }
        processedInstructorIds.add(instructorId)

        if (!grouped.has(instructorId)) {
          grouped.set(instructorId, {
            instructorName: instructor.instructorName,
            entries: new Map(),
          })
        }

        const group = grouped.get(instructorId)!
        const key = `${entry.dayOfWeek}-${entry.period}`
        if (!group.entries.has(key)) {
          group.entries.set(key, [])
        }
        // 同じentryが既に追加されていないかチェック（entry.idで判定）
        const existingEntryIds = group.entries.get(key)!.map(e => e.id)
        if (!existingEntryIds.includes(entry.id)) {
          group.entries.get(key)!.push(entry)
        }
      }
    }

    return grouped
  }, [timetableResult.timetableEntries])

  // 最大時限数を計算
  const maxPeriod = useMemo(
    () => calculateMaxPeriodFromEntries(timetableByTeacher),
    [timetableByTeacher]
  )

  // 使用されている曜日を抽出（availableな曜日だけ）
  const availableDays = useMemo(
    () => getAvailableDays(timetableResult.timetableEntries),
    [timetableResult.timetableEntries]
  )

  // 教員名でソート
  const sortedTeachers = useMemo(() => {
    return Array.from(timetableByTeacher.entries()).sort(([, a], [, b]) =>
      a.instructorName.localeCompare(b.instructorName, 'ja')
    )
  }, [timetableByTeacher])

  return (
    <div className={styles.timetablesSection}>
      {sortedTeachers.map(([instructorId, group]) => (
        <div key={instructorId} className={styles.homeroomTimetable}>
          <h2 className={styles.homeroomTitle}>{group.instructorName}</h2>
          <table className={styles.timetableTable}>
            <thead>
              <tr>
                <th className={styles.headerCell}>時限</th>
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
                      const entriesAtSameTime =
                        group.entries.get(`${day}-${period}`) || []
                      return (
                        <td key={day} className={styles.cell}>
                          {entriesAtSameTime.length > 0 ? (
                            <div className={styles.entry}>
                              <div className={styles.courseName}>
                                {entriesAtSameTime[0].course.courseName}
                              </div>
                              <div className={styles.details}>
                                <span className={styles.instructor}>
                                  {truncateJoinedText(
                                    entriesAtSameTime.map(
                                      e => e.homeroom.homeroomName
                                    ),
                                    '/',
                                    6
                                  )}
                                </span>
                                {entriesAtSameTime[0].course.courseDetails &&
                                  entriesAtSameTime[0].course.courseDetails
                                    .length > 0 && (
                                    <span className={styles.room}>
                                      {entriesAtSameTime[0].course.courseDetails
                                        .map(detail =>
                                          detail.room
                                            ? detail.room.roomName
                                            : '*'
                                        )
                                        .join('/')}
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
                )
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
