'use client'

import { useActionState, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getDefaultTtid } from '@/lib/graphql-client'
import { ConstraintDefinition } from '@/core/domain/entity'
import ConstraintDefinitionModal from '@/app/(private)/constraints/components/ConstraintDefinitionModal/ConstraintDefinitionModal'
import ConstraintDefinitionEntry from '@/app/(private)/constraints/components/ConstraintDefinitionEntry/ConstraintDefinitionEntry'
import { fetchConstraintDefinition } from '@/app/(private)/constraints/components/ConstraintDefinitionModal/actions'
import { ActionResult } from '@/types/bff-types'
import type { ConstraintDefinitionMasterResponse } from '@/types/graphql-types'
import type { ConstraintDefinitionFormValues } from '@/types/ui-types'
import styles from './ConstraintDefinitionsUi.module.css'

interface Props {
  constraintDefinitions: ConstraintDefinition[]
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
}

/**
 * 制約定義一覧画面
 */
export default function ConstraintDefinitionsUi({
  constraintDefinitions: initialConstraintDefinitions,
  constraintDefinitionMasters,
}: Props) {
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
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ttid }),
      })

      const result = await response.json()

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1>制約設定</h1>
        <button
          type="button"
          onClick={handleOptimize}
          disabled={isOptimizing}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isOptimizing ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isOptimizing ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => {
            if (!isOptimizing) {
              e.currentTarget.style.backgroundColor = '#218838'
            }
          }}
          onMouseLeave={e => {
            if (!isOptimizing) {
              e.currentTarget.style.backgroundColor = '#28a745'
            }
          }}
        >
          {isOptimizing ? '最適化中...' : '最適化を実行'}
        </button>
      </div>

      <div className={styles.constraintDefinitionsContainer}>
        {constraintDefinitions.length === 0 ? (
          <p>制約がまだ登録されていません。</p>
        ) : (
          constraintDefinitions.map(constraintDefinition => (
            <ConstraintDefinitionEntry
              key={constraintDefinition.id}
              constraintDefinition={constraintDefinition}
              onEdit={fetchConstraintDefinitionAction}
            />
          ))
        )}
        <button
          type="button"
          onClick={handleCreate}
          className={styles.addButton}
        >
          制約を追加する
        </button>
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
        onSuccess={handleModalSuccess}
        onClose={handleModalClose}
      />
    </>
  )
}
