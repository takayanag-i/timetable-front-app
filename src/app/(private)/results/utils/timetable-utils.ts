import type { TimetableResultType } from '@/lib/graphql/types'

type TimetableGroup = {
  entries: Map<string, TimetableResultType['timetableEntries'][0]>
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
