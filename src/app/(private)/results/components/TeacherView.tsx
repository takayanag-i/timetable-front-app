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

interface TeacherViewProps {
  timetableResult: TimetableResult
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
        entries: Map<string, TimetableResult['timetableEntries'][0]>
      }
    >()

    for (const entry of timetableResult.timetableEntries) {
      // courseDetailsから教員情報を取得
      const courseDetails = entry.course.courseDetails
      if (!courseDetails || courseDetails.length === 0) {
        continue
      }

      const instructor = courseDetails[0].instructor
      if (!instructor) {
        continue
      }

      const instructorId = instructor.id
      if (!grouped.has(instructorId)) {
        grouped.set(instructorId, {
          instructorName: instructor.instructorName,
          entries: new Map(),
        })
      }

      const group = grouped.get(instructorId)!
      const key = `${entry.dayOfWeek}-${entry.period}`
      group.entries.set(key, entry)
    }

    return grouped
  }, [timetableResult.timetableEntries])

  // 最大時限数を計算
  const maxPeriod = useMemo(
    () => calculateMaxPeriod(timetableByTeacher),
    [timetableByTeacher]
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
                              <div className={styles.details}>
                                <span className={styles.instructor}>
                                  学級: {entry.homeroom.homeroomName}
                                </span>
                                {entry.course.courseDetails &&
                                  entry.course.courseDetails.length > 0 &&
                                  entry.course.courseDetails[0].room && (
                                    <span className={styles.room}>
                                      教室:{' '}
                                      {
                                        entry.course.courseDetails[0].room
                                          .roomName
                                      }
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
