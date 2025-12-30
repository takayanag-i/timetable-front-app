import styles from './BlockEntry.module.css'
import LaneEntry from '@/app/(private)/curriculum/components/LaneEntry/LaneEntry'
import type { Lane } from '@/app/(private)/curriculum/types'
import type { OnEditBlockData } from '@/app/(private)/curriculum/components/BlockModal/types'

interface BlockEntryProps {
  blockId: string
  homeroomId: string
  gradeId: string | null
  blockName: string
  lanes: Lane[]
  onAddCourse: (formData: FormData) => void
  onEditCourse: (formData: FormData) => void
  onEditBlock: (data: OnEditBlockData) => void
}

/**
 * ブロックエントリ コンポーネント
 */
export default function BlockEntry({
  blockId,
  homeroomId,
  gradeId,
  blockName,
  lanes,
  onAddCourse,
  onEditCourse,
  onEditBlock,
}: BlockEntryProps) {
  // laneIdでソートする
  const sortedLanes = [...lanes].sort((a, b) => a.id.localeCompare(b.id))

  return (
    <div className={styles.blockEntry}>
      <button
        type="button"
        className={styles.blockHeaderButton}
        onClick={() =>
          onEditBlock({
            blockId,
            blockName,
            homeroomId,
            laneCount: sortedLanes.length,
          })
        }
      >
        <span className={styles.blockName}>{blockName}</span>
      </button>
      <div className={styles.laneContainer}>
        {sortedLanes.map(lane => (
          <LaneEntry
            key={lane.id}
            id={lane.id}
            blockId={blockId}
            gradeId={gradeId}
            courses={lane.courses}
            onAddCourse={onAddCourse}
            onEditCourse={onEditCourse}
          />
        ))}
      </div>
    </div>
  )
}
