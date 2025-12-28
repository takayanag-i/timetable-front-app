import type {
  TimetableResultQueryResponse,
  SchoolDayQueryResponse,
} from '@/app/(private)/results/[id]/graphql/types'
import { DAY_OF_WEEK_MAP } from '@/constants'

type TimetableGroup = {
  entries: Map<string, TimetableResultQueryResponse['timetableEntries'][0]>
}

// 英語形式の曜日配列（データ処理用）- 日曜日を含む
export const ENGLISH_DAYS_OF_WEEK: readonly string[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
]

// 再エクスポート（後方互換性のため）
export { DAY_OF_WEEK_MAP }

/**
 * 時間割エントリから最大時限数を計算
 */
export function calculateMaxPeriod(
  entries: Map<string, TimetableGroup>
): number {
  return Math.max(
    ...Array.from(entries.values()).flatMap(group =>
      Array.from(group.entries.values()).map(e => e.period)
    ),
    0
  )
}

/**
 * 時間割エントリから最大時限数を計算（教員ビュー用：entriesが配列の場合）
 */
export function calculateMaxPeriodFromEntries(
  entries: Map<
    string,
    {
      entries: Map<
        string,
        TimetableResultQueryResponse['timetableEntries'][0][]
      >
    }
  >
): number {
  let max = 0
  for (const group of entries.values()) {
    for (const entryArray of group.entries.values()) {
      for (const entry of entryArray) {
        if (entry.period > max) {
          max = entry.period
        }
      }
    }
  }
  return max
}

/**
 * 使用されている曜日を抽出（availableな曜日だけ）
 */
export function getAvailableDays(
  timetableEntries: TimetableResultQueryResponse['timetableEntries']
): string[] {
  const daysSet = new Set<string>()
  for (const entry of timetableEntries) {
    daysSet.add(entry.dayOfWeek)
  }
  // 曜日の順序を保持
  return ENGLISH_DAYS_OF_WEEK.filter(day => daysSet.has(day))
}

/**
 * 学校曜日から最大時限数を計算する
 *
 * @param schoolDays - 学校曜日の配列
 * @returns 最大時限数
 */
export function calculateMaxPeriodFromSchoolDays(
  schoolDays: SchoolDayQueryResponse[]
): number {
  return Math.max(
    ...schoolDays.map(day => (day.amPeriods ?? 0) + (day.pmPeriods ?? 0))
  )
}

/**
 * 学校曜日から使用可能な曜日の配列を抽出する
 *
 * @param schoolDays - 学校曜日の配列
 * @returns 使用可能な曜日の配列（文字列）
 */
export function getAvailableDaysFromSchoolDays(
  schoolDays: SchoolDayQueryResponse[]
): string[] {
  return schoolDays.filter(day => day.isAvailable).map(day => day.dayOfWeek)
}

/**
 * 文字列配列をjoinした後の合計がmaxLength文字までに制限するヘルパー関数（CourseEntryと同じ仕様）
 */
export function truncateJoinedText(
  texts: string[],
  separator: string = '/',
  maxLength: number = 6
): string {
  const joined = texts.join(separator)
  if (joined.length <= maxLength) return joined
  return joined.slice(0, maxLength) + '...'
}
