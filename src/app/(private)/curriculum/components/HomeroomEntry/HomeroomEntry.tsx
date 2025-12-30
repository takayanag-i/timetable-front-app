'use client'
import { startTransition } from 'react'
import BlockEntry from '@/app/(private)/curriculum/components/BlockEntry/BlockEntry'
import styles from './HomeroomEntry.module.css'
import type { Block } from '@/app/(private)/curriculum/types'
import type { OnEditBlockData } from '@/app/(private)/curriculum/components/BlockModal/types'

/**
 * HomeroomEntry コンポーネントのProps
 */
interface HomeroomEntryProps {
  blocks: Block[]
  homeroomId: string
  homeroomName: string
  gradeId: string | null
  /** 登録されたコースの単位数合計 */
  totalCredits: number
  /** ホームルームのコマ数総和 */
  totalPeriods: number
  /** Server Actionを受け取る */
  onEdit: (formData: FormData) => void
  /** 講座追加Server Actionを受け取る */
  onAddCourse: (formData: FormData) => void
  /** 講座編集Server Actionを受け取る */
  onEditCourse: (formData: FormData) => void
  /** ブロック追加Server Actionを受け取る */
  onAddBlock?: (formData: FormData) => void
  onEditBlock: (data: OnEditBlockData) => void
}

export default function HomeroomEntry({
  blocks,
  homeroomId,
  homeroomName,
  gradeId,
  totalCredits,
  totalPeriods,
  onEdit,
  onAddCourse,
  onEditCourse,
  onAddBlock,
  onEditBlock,
}: HomeroomEntryProps) {
  const isCreditsInsufficient = totalCredits < totalPeriods

  const handleEdit = () => {
    const formData = new FormData()
    formData.append('homeroomId', homeroomId)
    startTransition(() => {
      onEdit(formData)
    })
  }

  const handleAddBlock = () => {
    if (!onAddBlock) return

    const formData = new FormData()
    formData.append('homeroomId', homeroomId)
    startTransition(() => {
      onAddBlock(formData)
    })
  }

  return (
    <div className={styles.homeroomEntry}>
      <button
        type="button"
        onClick={handleEdit}
        className={styles.homeroomTitle}
      >
        {homeroomName}
      </button>
      {blocks.map(block => (
        <BlockEntry
          key={block.id}
          blockId={block.id}
          blockName={block.blockName}
          lanes={block.lanes}
          gradeId={gradeId}
          onAddCourse={onAddCourse}
          onEditCourse={onEditCourse}
          homeroomId={homeroomId}
          onEditBlock={onEditBlock}
        />
      ))}
      <div className={styles.creditsRow}>
        <span
          className={`${styles.creditsText} ${isCreditsInsufficient ? styles.creditsTextInsufficient : ''}`}
          title={
            isCreditsInsufficient
              ? `単位数が${totalPeriods - totalCredits}コマ不足しています`
              : '単位数が足りています'
          }
        >
          {totalCredits}/{totalPeriods}
        </span>
      </div>
      {onAddBlock && (
        <button
          type="button"
          onClick={handleAddBlock}
          className={styles.addBlockButton}
        >
          + ブロックを追加
        </button>
      )}
    </div>
  )
}
