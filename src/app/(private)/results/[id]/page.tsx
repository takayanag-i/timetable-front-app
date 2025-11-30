import { notFound } from 'next/navigation'
import { getTimetableResult } from '../../fetcher'
import TimetableResultUi from '../components/TimetableResultUi'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TimetableResultPage({ params }: PageProps) {
  const { id } = await params
  const timetableResult = await getTimetableResult(id)

  if (!timetableResult) {
    notFound()
  }

  return <TimetableResultUi timetableResult={timetableResult} />
}
