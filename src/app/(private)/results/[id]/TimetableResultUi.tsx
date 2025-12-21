import type {
  TimetableResultQueryResponse,
  SchoolDayQueryResponse,
} from '@/app/(private)/results/[id]/graphql/types'
import styles from './TimetableResultUi.module.css'
import ViewTabs from './components/ViewTabs'
import HomeroomView from './components/HomeroomView'
import HomeroomListView from './components/HomeroomListView'
import InstructorView from './components/InstructorView'
import InstructorListView from './components/InstructorListView'

type ViewType = 'homeroom' | 'homeroom-list' | 'instructor' | 'instructor-list'

interface TimetableResultUiProps {
  timetableResult: TimetableResultQueryResponse
  schoolDays: SchoolDayQueryResponse[]
  activeView?: string
}

/**
 * ビュータイプを検証・正規化する
 *
 * @param view - クエリパラメータのビュー値
 * @returns 有効なビュータイプ
 */
function parseViewType(view: string | undefined): ViewType {
  const validViews: ViewType[] = [
    'homeroom',
    'homeroom-list',
    'instructor',
    'instructor-list',
  ]
  if (view && validViews.includes(view as ViewType)) {
    return view as ViewType
  }
  return 'homeroom'
}

/**
 * アクティブビューに応じたコンポーネントをレンダリングする
 *
 * @param activeView - アクティブなビュータイプ
 * @param timetableResult - 時間割結果
 * @param schoolDays - 学校曜日の配列
 * @returns ビューコンポーネント
 */
function renderView(
  activeView: ViewType,
  timetableResult: TimetableResultQueryResponse,
  schoolDays: SchoolDayQueryResponse[]
) {
  switch (activeView) {
    case 'homeroom':
      return (
        <HomeroomView
          timetableResult={timetableResult}
          schoolDays={schoolDays}
        />
      )
    case 'homeroom-list':
      return (
        <HomeroomListView
          timetableResult={timetableResult}
          schoolDays={schoolDays}
        />
      )
    case 'instructor':
      return (
        <InstructorView
          timetableResult={timetableResult}
          schoolDays={schoolDays}
        />
      )
    case 'instructor-list':
      return (
        <InstructorListView
          timetableResult={timetableResult}
          schoolDays={schoolDays}
        />
      )
  }
}

/**
 * 時間割結果表示画面（Server Component）
 */
export default function TimetableResultUi({
  timetableResult,
  schoolDays,
  activeView: rawActiveView,
}: TimetableResultUiProps) {
  const activeView = parseViewType(rawActiveView)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>時間割編成結果</h1>
      </header>

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
      <ViewTabs activeView={activeView} resultId={timetableResult.id} />

      {/* 時間割表の表示 */}
      {renderView(activeView, timetableResult, schoolDays)}
    </div>
  )
}
