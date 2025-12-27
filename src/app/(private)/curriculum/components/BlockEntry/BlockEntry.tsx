import styles from './BlockEntry.module.css'
import LaneEntry from '@/app/(private)/curriculum/components/LaneEntry/LaneEntry'
import { Lane } from '@/core/domain/entity'
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
export default function BlockEntry(props: BlockEntryProps) {
  // laneIdでソートする
  const sortedLanes = [...props.lanes].sort((a, b) => a.id.localeCompare(b.id))

  return (
    <div className={styles.blockEntry}>
      <button
        type="button"
        className={styles.blockHeaderButton}
        onClick={() =>
          props.onEditBlock({
            blockId: props.blockId,
            blockName: props.blockName,
            homeroomId: props.homeroomId,
            laneCount: sortedLanes.length,
          })
        }
      >
        <span className={styles.blockName}>{props.blockName}</span>
      </button>
      <div className={styles.laneContainer}>
        {sortedLanes.map(lane => (
          <LaneEntry
            key={lane.id}
            id={lane.id}
            blockId={props.blockId}
            gradeId={props.gradeId}
            courses={lane.courses}
            onAddCourse={props.onAddCourse}
            onEditCourse={props.onEditCourse}
          />
        ))}
      </div>
    </div>
  )
}
