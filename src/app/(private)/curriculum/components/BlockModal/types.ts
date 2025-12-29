/**
 * BlockModalのフォーム値型
 */
export interface BlockFormValues {
  blockName: string
  laneCount: number
  homeroomId: string
  blockId: string
}

/**
 * ブロック編集コールバックの引数型
 */
export interface OnEditBlockData {
  blockId: string
  blockName: string
  homeroomId: string
  laneCount: number
}

/**
 * ブロック作成・更新のGraphQL Mutationレスポンス型
 */
export interface UpsertBlockResponse {
  id: string
  blockName: string
}
