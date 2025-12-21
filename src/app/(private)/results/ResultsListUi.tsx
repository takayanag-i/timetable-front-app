import Link from 'next/link'
import type { TimetableResultListUiQueryResponse } from '@/app/(private)/results/graphql/types'
import styles from './ResultsListPage.module.css'

interface ResultsListUiProps {
  results: TimetableResultListUiQueryResponse[]
}

/**
 * 編成結果一覧画面を返却するServer Component
 */
export default function ResultsListUi({ results }: ResultsListUiProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>編成結果</h1>
        <p className={styles.description}>
          時間割の編成結果を確認・管理できます
        </p>
      </header>

      {results.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h2 className={styles.emptyTitle}>編成結果がありません</h2>
          <p className={styles.emptyDescription}>
            カリキュラム設定と制約設定を完了してから、
            <br />
            時間割を編成してください
          </p>
        </div>
      ) : (
        <div className={styles.resultsList}>
          {results.map((result, index) => (
            <Link
              key={result.id}
              href={`/results/${result.id}`}
              className={styles.resultCard}
            >
              <div className={styles.resultIcon}>📅</div>
              <div className={styles.resultContent}>
                <h3 className={styles.resultTitle}>
                  編成結果 #{results.length - index}
                </h3>
                <p className={styles.resultId}>
                  ID: {result.id.slice(0, 8)}...
                </p>
              </div>
              <div className={styles.resultArrow}>→</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
