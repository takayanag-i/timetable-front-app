import type { TimetableResultType } from '@/app/(private)/results/graphql/types'
import {
  ENGLISH_DAYS_OF_WEEK,
  DAY_OF_WEEK_MAP,
  truncateJoinedText,
} from '../../utils/timetable-utils'
import TeacherViewClient from './TeacherViewClient'
import type { CellData, TeacherTimetableData, TeacherViewData } from './types'

interface TeacherViewProps {
  timetableResult: TimetableResultType
}

/**
 * エントリからセルデータを計算する
 *
 * @param entries - 同じ時限の時間割エントリ配列
 * @returns 計算済みのセルデータ
 */
function buildCellData(
  entries: TimetableResultType['timetableEntries']
): CellData {
  const firstEntry = entries[0]
  const courseDetails = firstEntry.course.courseDetails ?? []

  const homeroomText = truncateJoinedText(
    entries.map(e => e.homeroom.homeroomName),
    '/',
    6
  )

  const roomText = courseDetails
    .map(detail => detail.room?.roomName ?? '*')
    .join('/')

  return {
    courseName: firstEntry.course.courseName,
    homeroomText,
    roomText,
  }
}

/**
 * 時間割エントリを教員ごとにグループ化する
 *
 * @param entries - 時間割エントリの配列
 * @returns 教員ごとにグループ化されたデータ（ソート済み）
 */
function groupEntriesByTeacher(
  entries: TimetableResultType['timetableEntries']
): TeacherTimetableData[] {
  // 教員ごと、時限ごとにエントリを収集
  const tempGrouped = new Map<
    string,
    {
      instructorName: string
      entriesBySlot: Map<string, TimetableResultType['timetableEntries']>
    }
  >()

  for (const entry of entries) {
    const courseDetails = entry.course.courseDetails
    if (!courseDetails || courseDetails.length === 0) continue

    const processedInstructorIds = new Set<string>()

    for (const detail of courseDetails) {
      const instructor = detail.instructor
      if (!instructor) continue

      const instructorId = instructor.id
      if (processedInstructorIds.has(instructorId)) continue
      processedInstructorIds.add(instructorId)

      if (!tempGrouped.has(instructorId)) {
        tempGrouped.set(instructorId, {
          instructorName: instructor.instructorName,
          entriesBySlot: new Map(),
        })
      }

      const group = tempGrouped.get(instructorId)!
      const key = `${entry.dayOfWeek}-${entry.period}`

      if (!group.entriesBySlot.has(key)) {
        group.entriesBySlot.set(key, [])
      }

      const slotEntries = group.entriesBySlot.get(key)!
      if (!slotEntries.some(e => e.id === entry.id)) {
        slotEntries.push(entry)
      }
    }
  }

  // セルデータに変換
  const result: TeacherTimetableData[] = []
  for (const [instructorId, group] of tempGrouped) {
    const cells: Record<string, CellData> = {}
    for (const [key, slotEntries] of group.entriesBySlot) {
      cells[key] = buildCellData(slotEntries)
    }
    result.push({
      instructorId,
      instructorName: group.instructorName,
      cells,
    })
  }

  // 教員名でソート
  return result.sort((a, b) =>
    a.instructorName.localeCompare(b.instructorName, 'ja')
  )
}

/**
 * 使用されている曜日を抽出する
 *
 * @param entries - 時間割エントリの配列
 * @returns 曜日のキーとラベルの配列
 */
function extractAvailableDays(
  entries: TimetableResultType['timetableEntries']
): TeacherViewData['availableDays'] {
  const usedDays = new Set(entries.map(entry => entry.dayOfWeek))

  return ENGLISH_DAYS_OF_WEEK.filter(day => usedDays.has(day)).map(day => ({
    key: day,
    label: DAY_OF_WEEK_MAP[day],
  }))
}

/**
 * 最大時限数を計算する
 *
 * @param entries - 時間割エントリの配列
 * @returns 最大時限数
 */
function calculateMaxPeriod(
  entries: TimetableResultType['timetableEntries']
): number {
  if (entries.length === 0) return 0
  return Math.max(...entries.map(entry => entry.period))
}

/**
 * 時間割データを表示用に変換する
 *
 * @param timetableResult - 時間割結果
 * @returns 表示用のデータ
 */
function buildViewData(timetableResult: TimetableResultType): TeacherViewData {
  const { timetableEntries } = timetableResult

  const maxPeriod = calculateMaxPeriod(timetableEntries)
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1)

  return {
    teachers: groupEntriesByTeacher(timetableEntries),
    availableDays: extractAvailableDays(timetableEntries),
    periods,
  }
}

/**
 * 教員ビュー - 教員ごとに時間割を表示（Server Component）
 */
export default function TeacherView({ timetableResult }: TeacherViewProps) {
  const viewData = buildViewData(timetableResult)

  return <TeacherViewClient data={viewData} />
}

