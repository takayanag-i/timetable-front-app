import type {
  TimetableEntryQueryResponse,
  TimetableResultQueryResponse,
  SchoolDayQueryResponse,
} from '@/app/(private)/results/graphql/types'
import {
  DAY_OF_WEEK_MAP,
  truncateJoinedText,
  calculateMaxPeriodFromSchoolDays,
  getAvailableDaysFromSchoolDays,
} from '../../utils/timetable-utils'
import HomeroomListViewClient from './HomeroomListViewClient'
import type {
  CellData,
  ColumnHeader,
  HomeroomListViewData,
  HomeroomRowData,
} from './types'

interface HomeroomListViewProps {
  timetableResult: TimetableResultQueryResponse
  schoolDays: SchoolDayQueryResponse[]
}

/**
 * セルデータを計算する
 *
 * @param entry - 時間割エントリ
 * @returns セルデータ
 */
function buildCellData(entry: TimetableEntryQueryResponse): CellData {
  const instructorText = truncateJoinedText(
    entry.course.courseDetails.map(detail => detail.instructor.instructorName),
    '/',
    6
  )

  const roomText = truncateJoinedText(
    entry.course.courseDetails.map(detail => detail.room?.roomName ?? '*'),
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
  entries: TimetableResultQueryResponse['timetableEntries']
): HomeroomRowData[] {
  const grouped = entries.reduce<Map<string, HomeroomRowData>>((acc, entry) => {
    const homeroomId = entry.homeroom.id
    const cellKey = `${entry.dayOfWeek}-${entry.period}`

    const existing = acc.get(homeroomId)
    if (existing) {
      // 学級がaccに既にある場合
      existing.cells[cellKey] = buildCellData(entry)
    } else {
      // 学級がaccにない場合
      acc.set(homeroomId, {
        homeroomId,
        homeroomName: entry.homeroom.homeroomName,
        gradeName: entry.homeroom.grade?.gradeName,
        cells: { [cellKey]: buildCellData(entry) },
      })
    }

    return acc
  }, new Map())

  // valueのみを配列にして、ソートして返却
  return Array.from(grouped.values()).sort((a, b) => {
    if (a.gradeName && b.gradeName) {
      // 学年名を比較
      const gradeCompare = a.gradeName.localeCompare(b.gradeName, 'ja')
      if (gradeCompare !== 0) return gradeCompare
    }
    // 決まらない場合、学級名を比較
    return a.homeroomName.localeCompare(b.homeroomName, 'ja')
  })
}

/**
 * 列ヘッダを生成する
 *
 * @param schoolDays - 学校曜日の配列
 * @returns 列ヘッダの配列
 */
function buildColumnHeaders(
  schoolDays: SchoolDayQueryResponse[]
): ColumnHeader[] {
  const dayKeys = getAvailableDaysFromSchoolDays(schoolDays)
  const maxPeriod = calculateMaxPeriodFromSchoolDays(schoolDays)
  return dayKeys.flatMap(day =>
    Array.from({ length: maxPeriod }, (_, i) => ({
      key: `${day}-${i + 1}`,
      label: `${DAY_OF_WEEK_MAP[day]}${i + 1}`,
    }))
  )
}

/**
 * 学級一覧ビューのデータを返却するServer Component
 */
export default function HomeroomListView({
  timetableResult,
  schoolDays,
}: HomeroomListViewProps) {
  const { timetableEntries } = timetableResult

  const homerooms = groupEntriesByHomeroom(timetableEntries)

  const data: HomeroomListViewData = {
    homerooms,
    columnHeaders: buildColumnHeaders(schoolDays),
    rowHeaders: homerooms.map(homeroom => homeroom.homeroomName),
  }

  return <HomeroomListViewClient data={data} />
}
