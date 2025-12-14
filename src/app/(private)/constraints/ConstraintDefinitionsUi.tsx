'use client'

import { useActionState, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getDefaultTtid } from '@/lib/graphql-client'
import { ConstraintDefinition, Course } from '@/core/domain/entity'
import ConstraintDefinitionModal from '@/app/(private)/constraints/components/ConstraintDefinitionModal/ConstraintDefinitionModal'
import ConstraintDefinitionEntry from '@/app/(private)/constraints/components/ConstraintDefinitionEntry/ConstraintDefinitionEntry'
import { fetchConstraintDefinition } from '@/app/(private)/constraints/components/ConstraintDefinitionModal/actions'
import { ActionResult } from '@/types/server-action-types'
import type { ConstraintDefinitionMasterResponse } from '@/app/(private)/constraints/graphql/types'
import type { ConstraintDefinitionFormValues } from '@/types/ui-types'
import type { OptimizeRequest, OptimizeResult } from '@/app/api/optimize/types'
import styles from './ConstraintDefinitionsUi.module.css'

/**
 * ConstraintDefinitionsUi コンポーネントのProps
 */
interface ConstraintDefinitionsUiProps {
  constraintDefinitions: ConstraintDefinition[]
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
  maxPeriodsPerDay: number
  courses: Course[]
}

/**
 * 制約定義一覧画面
 */
export default function ConstraintDefinitionsUi({
  constraintDefinitions: initialConstraintDefinitions,
  constraintDefinitionMasters,
  maxPeriodsPerDay,
  courses,
}: ConstraintDefinitionsUiProps) {
  const router = useRouter()
  const [constraintDefinitions, setConstraintDefinitions] = useState(
    initialConstraintDefinitions
  )

  // propsの変更を監視して状態を更新
  useEffect(() => {
    setConstraintDefinitions(initialConstraintDefinitions)
  }, [initialConstraintDefinitions])

  // モーダルの状態管理
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<string | null>(null)

  // 制約定義取得Server Action
  const [fetchedConstraintDefinitionResult, fetchConstraintDefinitionAction] =
    useActionState(
      fetchConstraintDefinition,
      null as ActionResult<ConstraintDefinition> | null
    )

  // モーダルの初期値を計算
  const constraintDefinitionModalInitialValues =
    useMemo<ConstraintDefinitionFormValues>(() => {
      if (
        modalMode === 'edit' &&
        fetchedConstraintDefinitionResult?.success &&
        fetchedConstraintDefinitionResult.data
      ) {
        const data = fetchedConstraintDefinitionResult.data
        return {
          constraintDefinitionCode: data.constraintDefinitionCode,
          softFlag: data.softFlag,
          penaltyWeight: data.penaltyWeight?.toString() || '0.5',
          parameters: data.parameters
            ? JSON.stringify(data.parameters, null, 2)
            : '',
        }
      }
      // 新規作成モードのデフォルト値
      return {
        constraintDefinitionCode: '',
        softFlag: false,
        penaltyWeight: '0.5',
        parameters: '',
      }
    }, [modalMode, fetchedConstraintDefinitionResult])

  // 制約定義取得が成功したらモーダルを開く
  useEffect(() => {
    if (fetchedConstraintDefinitionResult?.success) {
      const data = fetchedConstraintDefinitionResult.data
      setEditingId(data.id)
      setModalMode('edit')
      setIsModalOpen(true)
    } else if (fetchedConstraintDefinitionResult?.success === false) {
      alert(`エラー: ${fetchedConstraintDefinitionResult.error}`)
    }
  }, [fetchedConstraintDefinitionResult])

  // モーダル成功時のハンドラー
  const handleModalSuccess = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setModalMode('create')
    // サーバーコンポーネントのデータを再フェッチ
    router.refresh()
  }

  // モーダルクローズ時のハンドラー
  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setModalMode('create')
  }

  // 新規作成ボタンのハンドラー
  const handleCreate = () => {
    setModalMode('create')
    setEditingId(null)
    setIsModalOpen(true)
  }

  // 最適化実行ボタンのハンドラー
  const [isOptimizing, setIsOptimizing] = useState(false)
  const handleOptimize = async () => {
    setIsOptimizing(true)
    try {
      const ttid = getDefaultTtid()
      const requestBody: OptimizeRequest = { ttid }
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = (await response.json()) as OptimizeResult

      if (!result.success) {
        alert(`最適化に失敗しました: ${result.error}`)
        return
      }

      // 結果画面に遷移
      if (result.timetableResultId) {
        router.push(`/results/${result.timetableResultId}`)
      } else {
        alert('結果IDが取得できませんでした')
      }
    } catch (error) {
      console.error('Optimization error:', error)
      alert(
        `最適化中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>制約設定</h1>
        <button
          type="button"
          onClick={handleOptimize}
          disabled={isOptimizing}
          className={styles.executeButton}
        >
          {isOptimizing ? '最適化中...' : '最適化を実行'}
          <span className={styles.executeButtonIcon}>▶</span>
        </button>
      </header>

      <div className={styles.constraintDefinitionsContainer}>
        {constraintDefinitions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚙️</div>
            <h2 className={styles.emptyTitle}>制約がまだ登録されていません</h2>
            <p className={styles.emptyDescription}>
              制約を追加して、時間割の編成ルールを設定しましょう
            </p>
          </div>
        ) : (
          // 制約コードでグループ化して表示
          Object.entries(
            constraintDefinitions.reduce(
              (groups, cd) => {
                const code = cd.constraintDefinitionCode
                if (!groups[code]) {
                  groups[code] = []
                }
                groups[code].push(cd)
                return groups
              },
              {} as Record<string, ConstraintDefinition[]>
            )
          ).map(([code, definitions]) => {
            const master = constraintDefinitionMasters.find(
              m => m.constraintDefinitionCode === code
            )
            return (
              <div key={code} className={styles.constraintSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    {master?.constraintDefinitionName || code}
                  </h2>
                  {master?.description && (
                    <p className={styles.sectionDescription}>
                      {master.description}
                    </p>
                  )}
                </div>
                <div className={styles.sectionContent}>
                  {definitions.map(constraintDefinition => (
                    <ConstraintDefinitionEntry
                      key={constraintDefinition.id}
                      constraintDefinition={constraintDefinition}
                      master={master}
                      courses={courses}
                      onEdit={fetchConstraintDefinitionAction}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}
        <div className={styles.addButtonWrapper}>
          <button
            type="button"
            onClick={handleCreate}
            className={styles.addButton}
          >
            + 制約を追加
          </button>
        </div>
      </div>

      <ConstraintDefinitionModal
        key={editingId || 'new'}
        isOpen={isModalOpen}
        mode={modalMode}
        title={modalMode === 'edit' ? '制約を編集' : '制約を追加しましょう！'}
        constraintDefinitionId={editingId || undefined}
        constraintDefinitionMasters={constraintDefinitionMasters}
        existingConstraintDefinitions={constraintDefinitions}
        initialValues={constraintDefinitionModalInitialValues}
        maxPeriodsPerDay={maxPeriodsPerDay}
        onSuccess={handleModalSuccess}
        onClose={handleModalClose}
      />
    </>
  )
}
