import { getTimetableResultsList } from '@/app/(private)/results/fetcher'
import ResultsListUi from '@/app/(private)/results/ResultsListUi'

export default async function ResultsListPage() {
  const results = await getTimetableResultsList()

  return <ResultsListUi results={results} />
}
