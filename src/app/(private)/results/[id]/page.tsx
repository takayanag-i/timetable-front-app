import { notFound } from 'next/navigation'
import { getTimetableResult } from '../fetcher'
import TimetableResultUi from '../components/TimetableResultUi'

type ViewType = 'homeroom' | 'homeroom-list' | 'teacher' | 'teacher-list'

interface PageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    view?: string
  }>
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
    'teacher',
    'teacher-list',
  ]
  if (view && validViews.includes(view as ViewType)) {
    return view as ViewType
  }
  return 'homeroom'
}

export default async function TimetableResultPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const { view } = await searchParams
  const timetableResult = await getTimetableResult(id)

  if (!timetableResult) {
    notFound()
  }

  const activeView = parseViewType(view)

  return (
    <TimetableResultUi
      timetableResult={timetableResult}
      activeView={activeView}
    />
  )
}
