import type { Homeroom } from '@/core/domain/entity'

/**
 * ホームルームのコマ数とcredits合計のバリデーション結果
 */
export interface HomeroomValidationResult {
    homeroomId: string
    homeroomName: string
    totalPeriods: number
    totalCredits: number
    isValid: boolean
}

/**
 * 単一のホームルームのコマ数とcredits合計を計算する
 *
 * @param homeroom - ホームルーム
 * @returns totalCreditsとtotalPeriods
 */
export function calculateHomeroomCredits(homeroom: Homeroom): {
    totalCredits: number
    totalPeriods: number
} {
    // ホームルームのコマ数総和を計算
    const totalPeriods = homeroom.homeroomDays.reduce(
        (sum, day) => sum + day.periods,
        0
    )

    // ブロック内のすべてのコースのcredits合計を計算
    // 各ブロックの最初のレーンのcreditsを計算（ブロック内のレーンは同時開講なので1レーン分のみ）
    const totalCredits = homeroom.blocks.reduce((blockSum, block) => {
        const firstLane = block.lanes[0]
        if (!firstLane) return blockSum

        const laneCredits = firstLane.courses.reduce((courseSum, course) => {
            const credits = course.subject?.credits ?? 0
            return courseSum + credits
        }, 0)

        return blockSum + laneCredits
    }, 0)

    return { totalCredits, totalPeriods }
}

/**
 * 各ホームルームのコマ数とcredits合計を検証する
 *
 * @param homerooms - ホームルーム一覧
 * @returns バリデーション結果の配列
 */
export function validateHomeroomCredits(
    homerooms: Homeroom[]
): HomeroomValidationResult[] {
    return homerooms.map(homeroom => {
        const { totalCredits, totalPeriods } = calculateHomeroomCredits(homeroom)

        return {
            homeroomId: homeroom.id,
            homeroomName: homeroom.homeroomName,
            totalPeriods,
            totalCredits,
            isValid: totalCredits >= totalPeriods,
        }
    })
}

/**
 * 各ホームルームのcredits/periodsをMapとして計算する
 *
 * @param homerooms - ホームルーム一覧
 * @returns ホームルームIDをキーとしたMap
 */
export function createHomeroomCreditsMap(
    homerooms: Homeroom[]
): Map<string, { totalCredits: number; totalPeriods: number }> {
    const results = validateHomeroomCredits(homerooms)
    return new Map(
        results.map(r => [
            r.homeroomId,
            { totalCredits: r.totalCredits, totalPeriods: r.totalPeriods },
        ])
    )
}

