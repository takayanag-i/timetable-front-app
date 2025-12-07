'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { TimetableResultType } from '@/lib/graphql/types'
import styles from './TimetableResultUi.module.css'
import ViewTabs from './ViewTabs'
import HomeroomView from './HomeroomView'
import HomeroomListView from './HomeroomListView'
import TeacherView from './TeacherView'
import TeacherListView from './TeacherListView'

/**
 * TimetableResultUi コンポーネントのProps
 */
interface TimetableResultUiProps {
  timetableResult: TimetableResultType
}

/**
 * 時間割結果表示画面
 */
export default function TimetableResultUi({
  timetableResult,
}: TimetableResultUiProps) {
  const [activeView, setActiveView] = useState<
    'homeroom' | 'homeroom-list' | 'teacher' | 'teacher-list'
  >('homeroom')

  return (
    <div className={styles.container}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 className={styles.title}>時間割編成結果</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link
            href="/curriculum"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#5a6268'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#6c757d'
            }}
          >
            カリキュラム設定へ
          </Link>
          <Link
            href="/constraints"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#5a6268'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#6c757d'
            }}
          >
            制約設定へ
          </Link>
        </div>
      </div>

      {/* 制約違反の表示 */}
      {timetableResult.constraintViolations.length > 0 && (
        <div className={styles.violationsSection}>
          <h2 className={styles.sectionTitle}>制約違反</h2>
          <ul className={styles.violationsList}>
            {timetableResult.constraintViolations.map(violation => (
              <li key={violation.id} className={styles.violationItem}>
                <span className={styles.violationCode}>
                  {violation.constraintViolationCode}
                </span>
                <span className={styles.violationKeys}>
                  {JSON.stringify(violation.violatingKeys)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ビュー切り替えタブ */}
      <ViewTabs activeView={activeView} onViewChange={setActiveView} />

      {/* 時間割表の表示 */}
      {activeView === 'homeroom' ? (
        <HomeroomView timetableResult={timetableResult} />
      ) : activeView === 'homeroom-list' ? (
        <HomeroomListView timetableResult={timetableResult} />
      ) : activeView === 'teacher' ? (
        <TeacherView timetableResult={timetableResult} />
      ) : (
        <TeacherListView timetableResult={timetableResult} />
      )}
    </div>
  )
}
