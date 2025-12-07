import styles from './BlockEntry.module.css'
import LaneEntry from '@/app/(private)/curriculum/components/LaneEntry/LaneEntry'
import { Lane } from '@/core/domain/entity'

/**
 * BlockEntry コンポーネントのProps
 */
interface BlockEntryProps {
  blockId: string
  lanes: Lane[]
  blockName: string
  gradeId?: string | null
  onAddCourse?: (formData: FormData) => void
  onEditCourse?: (formData: FormData) => void
  onEditBlock?: (data: {
    blockId: string
    blockName: string
    homeroomId: string
    laneCount: number
  }) => void
  homeroomId: string
}

export default function BlockEntry({
  blockId,
  blockName,
  lanes,
  gradeId,
  onAddCourse,
  onEditCourse,
  onEditBlock,
  homeroomId,
}: BlockEntryProps) {
  // laneIdでソートして表示順を安定させる
  const sortedLanes = [...lanes].sort((a, b) => a.id.localeCompare(b.id))

  return (
    <div className={styles.blockEntry}>
      <button
        type="button"
        className={styles.blockHeaderButton}
        onClick={() =>
          onEditBlock?.({
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
