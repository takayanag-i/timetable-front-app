import type {
  TimetableResultQueryResponse,
  TimetableEntryQueryResponse,
  SchoolDayQueryResponse,
} from '@/app/(private)/results/graphql/types'
import {
  DAY_OF_WEEK_MAP,
  truncateJoinedText,
  calculateMaxPeriodFromSchoolDays,
  getAvailableDaysFromSchoolDays,
} from '../../utils/timetable-utils'
import InstructorViewClient from './InstructorViewClient'
import type {
  CellData,
  ColumnHeader,
  InstructorTimetableData,
  InstructorViewData,
} from './types'

interface InstructorViewProps {
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
 * @returns 教員ごとにグループ化されたデータ
 */
function groupEntriesByInstructor(
  entries: TimetableEntryQueryResponse[]
): InstructorTimetableData[] {
  // 教員ごと、時限ごとにエントリを収集する
  const instructorMap = entries.reduce<
    Map<
      string, // 教員ID
      {
        instructorName: string
        slotMap: Map<
          string, // 曜日-時限
          TimetableEntryQueryResponse[]
        >
      }
    >
  >((acc, entry) => {
    const courseDetails = entry.course.courseDetails

    for (const detail of courseDetails) {
      const instructor = detail.instructor
      const instructorId = instructor.id

      if (!acc.has(instructorId)) {
        // 教員IDがinstructorMapにない場合、追加する
        acc.set(instructorId, {
          instructorName: instructor.instructorName,
          slotMap: new Map(),
        })
      }

      const instructorValue = acc.get(instructorId)!
      const slotKey = `${entry.dayOfWeek}-${entry.period}`

      if (!instructorValue.slotMap.has(slotKey)) {
        // 曜日-時限がslotMapにない場合、追加する
        instructorValue.slotMap.set(slotKey, [])
      }

      const slotValue = instructorValue.slotMap.get(slotKey)!
      slotValue.push(entry)
    }

    return acc
  }, new Map())

  // セルデータに変換
  const result: InstructorTimetableData[] = Array.from(instructorMap.entries())
    // 教員をループ
    .map(([instructorId, instructorValue]) => {
      const cells = Array.from(instructorValue.slotMap.entries()).map(
        ([slotKey, slotValue]) => [slotKey, buildCellData(slotValue)]
      )

      return {
        instructorId,
        instructorName: instructorValue.instructorName,
        cells: Object.fromEntries(cells),
      }
    })

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
 * 教員ビューのデータを返却するServer Component
 */
export default function InstructorView({
  timetableResult,
  schoolDays,
}: InstructorViewProps) {
  const { timetableEntries } = timetableResult

  const data: InstructorViewData = {
    instructors: groupEntriesByInstructor(timetableEntries),
    columnHeaders: buildColumnHeaders(schoolDays),
    rowHeaders: buildRowHeaders(schoolDays),
  }

  return <InstructorViewClient data={data} />
}
