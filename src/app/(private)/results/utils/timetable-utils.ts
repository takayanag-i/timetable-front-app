import type { TimetableResultType } from '@/app/(private)/results/graphql/types'

type TimetableGroup = {
  entries: Map<string, TimetableResultType['timetableEntries'][0]>
}

// 英語形式の曜日配列（データ処理用）
export const ENGLISH_DAYS_OF_WEEK: readonly string[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
]

// 英語→日本語の変換マップ（表示用）
export const DAY_OF_WEEK_MAP: Record<string, string> = {
  mon: '月',
  tue: '火',
  wed: '水',
  thu: '木',
  fri: '金',
  sat: '土',
  sun: '日',
}

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
      entries: Map<string, TimetableResultType['timetableEntries'][0][]>
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
  timetableEntries: TimetableResultType['timetableEntries']
): string[] {
  const daysSet = new Set<string>()
  for (const entry of timetableEntries) {
    daysSet.add(entry.dayOfWeek)
  }
  // 曜日の順序を保持
  return ENGLISH_DAYS_OF_WEEK.filter(day => daysSet.has(day))
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
