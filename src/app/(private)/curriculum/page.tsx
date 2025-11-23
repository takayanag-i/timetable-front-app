import { getGrades, getHomerooms } from '@/app/(private)/curriculum/fetcher'
import CurriculumUi from '@/app/(private)/curriculum/CurriculumUi'

// データフェッチしてる
export default async function Page() {
  // 複数のhomeroomを取得
  const homerooms = await getHomerooms()
  const grades = await getGrades()

  return <CurriculumUi homerooms={homerooms} grades={grades} />
}
