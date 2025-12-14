import {
  getConstraintDefinitions,
  getConstraintDefinitionMasters,
  getMaxPeriodsPerDay,
  getCourses,
} from '@/app/(private)/constraints/fetcher'
import ConstraintDefinitionsUi from '@/app/(private)/constraints/ConstraintDefinitionsUi'

export default async function Page() {
  const [
    constraintDefinitions,
    constraintDefinitionMasters,
    maxPeriodsPerDay,
    courses,
  ] = await Promise.all([
    getConstraintDefinitions(),
    getConstraintDefinitionMasters(),
    getMaxPeriodsPerDay(),
    getCourses(),
  ])

  return (
    <ConstraintDefinitionsUi
      constraintDefinitions={constraintDefinitions}
      constraintDefinitionMasters={constraintDefinitionMasters}
      maxPeriodsPerDay={maxPeriodsPerDay}
      courses={courses}
    />
  )
}
