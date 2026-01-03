import type { HomeroomDayType } from './types'
import type { SchoolDay } from '@/app/(private)/curriculum/types'

/**
 * 学校曜日から学級曜日のデフォルト値を生成
 *
 * @param schoolDays - 学校曜日データ
 * @returns 学級曜日のデフォルト値
 */
export function createDefaultHomeroomDays(
  schoolDays: SchoolDay[]
): HomeroomDayType[] {
  return schoolDays
    .filter(day => day.isAvailable)
    .map(day => ({
      id: day.id,
      dayOfWeek: day.dayOfWeek,
      periods: day.amPeriods + day.pmPeriods,
    }))
}

