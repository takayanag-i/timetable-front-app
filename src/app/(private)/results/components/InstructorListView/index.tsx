import type {
  TimetableResultQueryResponse,
  SchoolDayQueryResponse,
} from '@/app/(private)/results/graphql/types'
import {
  DAY_OF_WEEK_MAP,
  truncateJoinedText,
  calculateMaxPeriodFromSchoolDays,
  getAvailableDaysFromSchoolDays,
} from '../../utils/timetable-utils'
import InstructorListViewClient from './InstructorListViewClient'
import type {
  CellData,
  ColumnHeader,
  InstructorListViewData,
  InstructorRowData,
} from './types'

interface InstructorListViewProps {
  timetableResult: TimetableResultQueryResponse
  schoolDays: SchoolDayQueryResponse[]
}

/**
 * エントリからセルデータを計算する
 *
 * @param entries - 同じ時限の時間割エントリ配列
 * @returns 計算済みのセルデータ
 */
function buildCellData(
  entries: TimetableResultQueryResponse['timetableEntries']
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
function groupEntriesByInstructor(
  entries: TimetableResultQueryResponse['timetableEntries']
): InstructorRowData[] {
  // 教員ごと、時限ごとにエントリを収集
  const tempGrouped = new Map<
    string,
    {
      instructorName: string
      entriesBySlot: Map<
        string,
        TimetableResultQueryResponse['timetableEntries']
      >
    }
  >()

  for (const entry of entries) {
    const courseDetails = entry.course.courseDetails
    if (!courseDetails || courseDetails.length === 0) continue

    for (const detail of courseDetails) {
      const instructor = detail.instructor
      if (!instructor) continue

      const instructorId = instructor.id

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
  const result: InstructorRowData[] = []
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
 * 教員一覧ビューのデータを返却するServer Component
 */
export default function InstructorListView({
  timetableResult,
  schoolDays,
}: InstructorListViewProps) {
  const { timetableEntries } = timetableResult

  const instructors = groupEntriesByInstructor(timetableEntries)

  const data: InstructorListViewData = {
    instructors,
    columnHeaders: buildColumnHeaders(schoolDays),
    rowHeaders: instructors.map(instructor => instructor.instructorName),
  }

  return <InstructorListViewClient data={data} />
}
