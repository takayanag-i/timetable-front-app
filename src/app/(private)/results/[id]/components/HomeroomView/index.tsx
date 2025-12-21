import type {
  TimetableEntryQueryResponse,
  TimetableResultQueryResponse,
  SchoolDayQueryResponse,
} from '@/app/(private)/results/[id]/graphql/types'
import {
  DAY_OF_WEEK_MAP,
  truncateJoinedText,
  calculateMaxPeriodFromSchoolDays,
  getAvailableDaysFromSchoolDays,
} from '../../utils/timetable-utils'
import HomeroomViewClient from './HomeroomViewClient'
import type {
  CellData,
  ColumnHeader,
  HomeroomTimetableData,
  HomeroomViewData,
} from './types'

interface HomeroomViewProps {
  timetableResult: TimetableResultQueryResponse
  schoolDays: SchoolDayQueryResponse[]
}

/**
 * セルデータを作成する
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
    subjectName: entry.course.subject.subjectName,
    instructorText,
    roomText,
  }
}

/**
 * 時間割エントリを学級ごとにグループ化する
 *
 * @param entries - 時間割エントリの配列
 * @returns 学級ごとにグループ化されたデータ
 */
function groupEntriesByHomeroom(
  entries: TimetableEntryQueryResponse[]
): HomeroomTimetableData[] {
  const grouped = entries.reduce<Map<string, HomeroomTimetableData>>(
    (acc, entry) => {
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
          gradeName: entry.homeroom.grade.gradeName,
          cells: { [cellKey]: buildCellData(entry) },
        })
      }

      return acc
    },
    new Map()
  )

  // valueのみを配列にして返却
  return Array.from(grouped.values())
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
  return getAvailableDaysFromSchoolDays(schoolDays).map(day => ({
    key: day,
    label: DAY_OF_WEEK_MAP[day],
  }))
}

/**
 * 行ヘッダを生成する
 *
 * @param schoolDays - 学校曜日の配列
 * @returns 行ヘッダの配列
 */
function buildRowHeaders(schoolDays: SchoolDayQueryResponse[]): number[] {
  const maxPeriod = calculateMaxPeriodFromSchoolDays(schoolDays)
  return Array.from({ length: maxPeriod }, (_, i) => i + 1)
}

/**
 * 学級ビューのデータを返却するServer Component
 */
export default function HomeroomView({
  timetableResult,
  schoolDays,
}: HomeroomViewProps) {
  const { timetableEntries } = timetableResult

  const data: HomeroomViewData = {
    homerooms: groupEntriesByHomeroom(timetableEntries),
    columnHeaders: buildColumnHeaders(schoolDays),
    rowHeaders: buildRowHeaders(schoolDays),
  }

  return <HomeroomViewClient data={data} />
}
