import type { TimetableResult } from '@/types/graphql-types'

/**
 * 時間割エントリから最大時限数を計算
 */
export function calculateMaxPeriod(
  entries: Map<string, Map<string, TimetableResult['timetableEntries'][0]>>
): number {
  return Math.max(
    ...Array.from(entries.values()).flatMap(group =>
      Array.from(group.entries.values()).map(e => e.period)
    ),
    0
  )
}
