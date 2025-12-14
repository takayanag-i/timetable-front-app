import {
  getConstraintDefinitions,
  getConstraintDefinitionMasters,
  getMaxPeriodsPerDay,
} from '@/app/(private)/constraints/fetcher'
import ConstraintDefinitionsUi from '@/app/(private)/constraints/ConstraintDefinitionsUi'

export default async function Page() {
  const [constraintDefinitions, constraintDefinitionMasters, maxPeriodsPerDay] =
    await Promise.all([
      getConstraintDefinitions(),
      getConstraintDefinitionMasters(),
      getMaxPeriodsPerDay(),
    ])

  return (
    <ConstraintDefinitionsUi
      constraintDefinitions={constraintDefinitions}
      constraintDefinitionMasters={constraintDefinitionMasters}
      maxPeriodsPerDay={maxPeriodsPerDay}
    />
  )
}
