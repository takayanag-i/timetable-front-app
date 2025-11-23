import BlockEntry from '@/app/(private)/curriculum/components/BlockEntry/BlockEntry'
import styles from './HomeroomEntry.module.css'
import { Block as BlockEntity } from '@/core/domain/entity'

interface Props {
  blocks: BlockEntity[]
  homeroomId: string
  homeroomName: string
  gradeId?: string | null
  onEdit: (formData: FormData) => void // Server Actionを受け取る
  onAddCourse?: (formData: FormData) => void // 講座追加Server Actionを受け取る
  onEditCourse?: (formData: FormData) => void // 講座編集Server Actionを受け取る
  onAddBlock?: (formData: FormData) => void // ブロック追加Server Actionを受け取る
  onEditBlock?: (data: {
    blockId: string
    blockName: string
    homeroomId: string
    laneCount: number
  }) => void
}

export default function HomeroomEntry({
  blocks,
  homeroomId,
  homeroomName,
  gradeId,
  onEdit,
  onAddCourse,
  onEditCourse,
  onAddBlock,
  onEditBlock,
}: Props) {
  return (
    <div className={styles.homeroomEntry}>
      <form action={onEdit}>
        <input type="hidden" name="homeroomId" value={homeroomId} />
        <button type="submit" className={styles.homeroomTitle}>
          {homeroomName}
        </button>
      </form>
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
      {onAddBlock && (
        <form action={onAddBlock}>
          <input type="hidden" name="homeroomId" value={homeroomId} />
          <button type="submit" className={styles.addBlockButton}>
            + ブロックを追加
          </button>
        </form>
      )}
    </div>
  )
}
