import type { TimetableResultType } from '@/app/(private)/results/graphql/types'
import {
  ENGLISH_DAYS_OF_WEEK,
  DAY_OF_WEEK_MAP,
  truncateJoinedText,
} from '../../utils/timetable-utils'
import TeacherListViewClient from './TeacherListViewClient'
import type {
  CellData,
  ColumnHeader,
  TeacherListViewData,
  TeacherRowData,
} from './types'

interface TeacherListViewProps {
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

  const roomText = truncateJoinedText(
    courseDetails.map(detail => detail.room?.roomName ?? '*'),
    '/',
    6
  )

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
): TeacherRowData[] {
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
  const result: TeacherRowData[] = []
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
 * @returns 使用されている曜日の配列
 */
function extractAvailableDays(
  entries: TimetableResultType['timetableEntries']
): string[] {
  const usedDays = new Set(entries.map(entry => entry.dayOfWeek))
  return ENGLISH_DAYS_OF_WEEK.filter(day => usedDays.has(day))
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
 * 列ヘッダーを生成する
 *
 * @param availableDays - 使用されている曜日
 * @param maxPeriod - 最大時限数
 * @returns 列ヘッダーの配列
 */
function buildColumnHeaders(
  availableDays: string[],
  maxPeriod: number
): ColumnHeader[] {
  const headers: ColumnHeader[] = []
  for (const day of availableDays) {
    for (let period = 1; period <= maxPeriod; period++) {
      headers.push({
        key: `${day}-${period}`,
        label: `${DAY_OF_WEEK_MAP[day]}${period}`,
      })
    }
  }
  return headers
}

/**
 * 時間割データを表示用に変換する
 *
 * @param timetableResult - 時間割結果
 * @returns 表示用のデータ
 */
function buildViewData(
  timetableResult: TimetableResultType
): TeacherListViewData {
  const { timetableEntries } = timetableResult

  const availableDays = extractAvailableDays(timetableEntries)
  const maxPeriod = calculateMaxPeriod(timetableEntries)

  return {
    teachers: groupEntriesByTeacher(timetableEntries),
    columnHeaders: buildColumnHeaders(availableDays, maxPeriod),
  }
}

/**
 * 教員一覧ビュー - 曜日×時限を横に並べ、教員を縦に並べる（Server Component）
 */
export default function TeacherListView({
  timetableResult,
}: TeacherListViewProps) {
  const viewData = buildViewData(timetableResult)

  return <TeacherListViewClient data={viewData} />
}

