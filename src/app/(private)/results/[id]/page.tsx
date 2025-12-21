import { notFound } from 'next/navigation'
import { getTimetableResult } from './fetcher'
import TimetableResultUi from './TimetableResultUi'

interface PageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    view?: string
  }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params
  const { view } = await searchParams
  const result = await getTimetableResult(id)

  if (!result) {
    notFound()
  }

  return (
    <TimetableResultUi
      timetableResult={result.timetableResult}
      schoolDays={result.schoolDays}
      activeView={view}
    />
  )
}
