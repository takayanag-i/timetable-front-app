'use client'

import { useMemo } from 'react'
import type { TimetableResultType } from '@/app/(private)/results/graphql/types'
import {
  calculateMaxPeriodFromEntries,
  DAY_OF_WEEK_MAP,
  getAvailableDays,
  truncateJoinedText,
} from '../utils/timetable-utils'
import styles from './TimetableResultUi.module.css'

interface TeacherListViewProps {
  timetableResult: TimetableResultType
}

/**
 * 教員一覧ビュー - 曜日×時限（availableのみ）を横に並べ、教員を縦に並べる
 */
export default function TeacherListView({
  timetableResult,
}: TeacherListViewProps) {
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
      <div className={`${styles.homeroomTimetable} ${styles.teacherListView}`}>
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
            {sortedTeachers.map(([instructorId, group]) => (
              <tr key={instructorId}>
                <td
                  className={`${styles.periodCell} ${styles.homeroomNameCell}`}
                >
                  <div>{group.instructorName}</div>
                </td>
                {columnHeaders.map(header => {
                  const entriesAtSameTime =
                    group.entries.get(`${header.day}-${header.period}`) || []
                  return (
                    <td
                      key={`${header.day}-${header.period}`}
                      className={styles.cell}
                    >
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
                              entriesAtSameTime[0].course.courseDetails.length >
                                0 && (
                                <span className={styles.room}>
                                  {truncateJoinedText(
                                    entriesAtSameTime[0].course.courseDetails.map(
                                      detail =>
                                        detail.room ? detail.room.roomName : '*'
                                    ),
                                    '/',
                                    6
                                  )}
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
    </div>
  )
}
