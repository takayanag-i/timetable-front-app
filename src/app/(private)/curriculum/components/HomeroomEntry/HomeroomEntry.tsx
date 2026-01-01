'use client'
import BlockEntry from '@/app/(private)/curriculum/components/BlockEntry/BlockEntry'
import styles from './HomeroomEntry.module.css'
import type { Block } from '@/app/(private)/curriculum/types'
import type { OnEditBlockData } from '@/app/(private)/curriculum/components/BlockModal/types'
import type {
  OnEditHomeroomData,
  OnAddCourseData,
  OnEditCourseData,
  OnAddBlockData,
} from './types'

/**
 * HomeroomEntry コンポーネントのProps
 */
interface HomeroomEntryProps {
  blocks: Block[]
  homeroomId: string
  homeroomName: string
  gradeId: string | null
  totalCredits: number
  totalPeriods: number
  onEditHomeroom: (data: OnEditHomeroomData) => void
  onAddCourse: (data: OnAddCourseData) => void
  onEditCourse: (data: OnEditCourseData) => void
  onAddBlock: (data: OnAddBlockData) => void
  onEditBlock: (data: OnEditBlockData) => void
}

export default function HomeroomEntry({
  blocks,
  homeroomId,
  homeroomName,
  gradeId,
  totalCredits,
  totalPeriods,
  onEditHomeroom,
  onAddCourse,
  onEditCourse,
  onAddBlock,
  onEditBlock,
}: HomeroomEntryProps) {
  const isCreditsInsufficient = totalCredits < totalPeriods

  return (
    <div className={styles.homeroomEntry}>
      <button
        type="button"
        onClick={() => onEditHomeroom({ homeroomId })}
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
      <button
        type="button"
        onClick={() => onAddBlock({ homeroomId })}
        className={styles.addBlockButton}
      >
        + ブロックを追加
      </button>
    </div>
  )
}
