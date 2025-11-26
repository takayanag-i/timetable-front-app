import { getHomeroomsAndGrades } from '@/app/(private)/curriculum/fetcher'
import CurriculumUi from '@/app/(private)/curriculum/CurriculumUi'

// データフェッチしてる
export default async function Page() {
  // 学級と学年を1回のリクエストで取得（リクエスト数削減によるパフォーマンス向上）
  const { homerooms, grades } = await getHomeroomsAndGrades()

  return <CurriculumUi homerooms={homerooms} grades={grades} />
}
