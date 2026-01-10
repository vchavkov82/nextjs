import { type ComponentPropsWithoutRef } from 'react'
import { ProjectConfigVariables as ProjectConfigVariablesClient } from './ProjectConfigVariables'

const ProjectConfigVariables = (props: ComponentPropsWithoutRef<typeof ProjectConfigVariablesClient>) => {
  return <ProjectConfigVariablesClient {...props} />
}

export { ProjectConfigVariables }
