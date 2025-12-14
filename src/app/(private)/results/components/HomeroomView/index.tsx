import type { TimetableResultType } from '@/app/(private)/results/graphql/types'
import {
    ENGLISH_DAYS_OF_WEEK,
    DAY_OF_WEEK_MAP,
    truncateJoinedText,
} from '../../utils/timetable-utils'
import HomeroomViewClient from './HomeroomViewClient'
import type { CellData, HomeroomTimetableData, HomeroomViewData } from './types'

interface HomeroomViewProps {
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
        subjectName: entry.course.subject?.subjectName,
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
    entries: TimetableResultType['timetableEntries']
): HomeroomTimetableData[] {
    const grouped = entries.reduce<Map<string, HomeroomTimetableData>>(
        (acc, entry) => {
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
        },
        new Map()
    )

    return Array.from(grouped.values())
}

/**
 * 使用されている曜日を抽出する
 *
 * @param entries - 時間割エントリの配列
 * @returns 曜日のキーとラベルの配列
 */
function extractAvailableDays(
    entries: TimetableResultType['timetableEntries']
): HomeroomViewData['availableDays'] {
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
function buildViewData(timetableResult: TimetableResultType): HomeroomViewData {
    const { timetableEntries } = timetableResult

    const maxPeriod = calculateMaxPeriod(timetableEntries)
    const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1)

    return {
        homerooms: groupEntriesByHomeroom(timetableEntries),
        availableDays: extractAvailableDays(timetableEntries),
        periods,
    }
}

/**
 * 学級ビュー - 学級ごとに時間割を表示（Server Component）
 */
export default function HomeroomView({ timetableResult }: HomeroomViewProps) {
    const viewData = buildViewData(timetableResult)

    return <HomeroomViewClient data={viewData} />
}

