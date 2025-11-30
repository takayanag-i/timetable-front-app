import {
  getConstraintDefinitions,
  getConstraintDefinitionMasters,
} from '@/app/(private)/constraints/fetcher'
import ConstraintDefinitionsUi from '@/app/(private)/constraints/ConstraintDefinitionsUi'

export default async function Page() {
  const [constraintDefinitions, constraintDefinitionMasters] =
    await Promise.all([
      getConstraintDefinitions(),
      getConstraintDefinitionMasters(),
    ])

  return (
    <ConstraintDefinitionsUi
      constraintDefinitions={constraintDefinitions}
      constraintDefinitionMasters={constraintDefinitionMasters}
    />
  )
}
