import type { TimetableResultType } from '@/app/(private)/results/graphql/types'
import {
  ENGLISH_DAYS_OF_WEEK,
  DAY_OF_WEEK_MAP,
  truncateJoinedText,
} from '../../utils/timetable-utils'
import HomeroomListViewClient from './HomeroomListViewClient'
import type {
  CellData,
  ColumnHeader,
  HomeroomListViewData,
  HomeroomRowData,
} from './types'

interface HomeroomListViewProps {
  timetableResult: TimetableResultType
}

/**
 * セルデータを計算する
 *
 * @param entry - 時間割エントリ
 * @returns 計算済みのセルデータ
 */
function buildCellData(
  entry: TimetableResultType['timetableEntries'][0]
): CellData {
  const courseDetails = entry.course.courseDetails ?? []

  const instructorText = truncateJoinedText(
    courseDetails
      .map(detail => detail.instructor?.instructorName ?? '')
      .filter(Boolean),
    '/',
    6
  )

  const roomText = truncateJoinedText(
    courseDetails.map(detail => detail.room?.roomName ?? '*'),
    '/',
    6
  )

  return {
    courseName: entry.course.courseName,
    instructorText,
    roomText,
  }
}

/**
 * 時間割エントリを学級ごとにグループ化する
 *
 * @param entries - 時間割エントリの配列
 * @returns 学級ごとにグループ化されたデータ（ソート済み）
 */
function groupEntriesByHomeroom(
  entries: TimetableResultType['timetableEntries']
): HomeroomRowData[] {
  const grouped = entries.reduce<Map<string, HomeroomRowData>>((acc, entry) => {
    const homeroomId = entry.homeroom.id
    const cellKey = `${entry.dayOfWeek}-${entry.period}`

    const existing = acc.get(homeroomId)
    if (existing) {
      existing.cells[cellKey] = buildCellData(entry)
    } else {
      acc.set(homeroomId, {
        homeroomId,
        homeroomName: entry.homeroom.homeroomName,
        gradeName: entry.homeroom.grade?.gradeName,
        cells: { [cellKey]: buildCellData(entry) },
      })
    }

    return acc
  }, new Map())

  // 学年名 → 学級名でソート
  return Array.from(grouped.values()).sort((a, b) => {
    if (a.gradeName && b.gradeName) {
      const gradeCompare = a.gradeName.localeCompare(b.gradeName, 'ja')
      if (gradeCompare !== 0) return gradeCompare
    }
    return a.homeroomName.localeCompare(b.homeroomName, 'ja')
  })
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
): HomeroomListViewData {
  const { timetableEntries } = timetableResult

  const availableDays = extractAvailableDays(timetableEntries)
  const maxPeriod = calculateMaxPeriod(timetableEntries)

  return {
    homerooms: groupEntriesByHomeroom(timetableEntries),
    columnHeaders: buildColumnHeaders(availableDays, maxPeriod),
  }
}

/**
 * 学級一覧ビュー - 月1時限から金の最後の時限まで横に並べ、学級を縦に並べる（Server Component）
 */
export default function HomeroomListView({
  timetableResult,
}: HomeroomListViewProps) {
  const viewData = buildViewData(timetableResult)

  return <HomeroomListViewClient data={viewData} />
}

