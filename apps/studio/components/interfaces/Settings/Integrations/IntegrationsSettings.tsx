import Link from 'next/link'

import { useFlag } from 'common'
import { ScaffoldContainer, ScaffoldDivider } from 'components/layouts/Scaffold'
import { useProjectDetailQuery } from 'data/projects/project-detail-query'
import { useIsFeatureEnabled } from 'hooks/misc/useIsFeatureEnabled'
import { useSelectedProjectQuery } from 'hooks/misc/useSelectedProject'
import { AlertDescription_Shadcn_, AlertTitle_Shadcn_, Alert_Shadcn_, WarningIcon } from 'ui'
import { AWSPrivateLinkSection } from './AWSPrivateLink/AWSPrivateLinkSection'

const IntegrationSettings = () => {
  const { data: project } = useSelectedProjectQuery()
  const { data: parentProject } = useProjectDetailQuery({ ref: project?.parent_project_ref })
  const isBranch = project?.parent_project_ref !== undefined

  const showAWSPrivateLinkFeature = useIsFeatureEnabled('integrations:aws_private_link')
  const showAWSPrivateLinkConfigCat = useFlag('awsPrivateLinkIntegration')
  // PrivateLink is not available in eu-central-2 (Zurich) until Feb 2026
  const isPrivateLinkUnsupportedRegion = project?.region === 'eu-central-2'
  const showAWSPrivateLink =
    showAWSPrivateLinkFeature && showAWSPrivateLinkConfigCat && !isPrivateLinkUnsupportedRegion

  return (
    <>
      {isBranch && (
        <ScaffoldContainer>
          <Alert_Shadcn_ variant="default" className="mt-6">
            <WarningIcon />
            <AlertTitle_Shadcn_>
              You are currently on a preview branch of your project
            </AlertTitle_Shadcn_>
            <AlertDescription_Shadcn_>
              To adjust your project's integration settings, you may return to your{' '}
              <Link href={`/project/${parentProject?.ref}/settings/general`} className="text-brand">
                main branch
              </Link>
              .
            </AlertDescription_Shadcn_>
          </Alert_Shadcn_>
        </ScaffoldContainer>
      )}
      {showAWSPrivateLink && (
        <>
          <ScaffoldDivider />
          <AWSPrivateLinkSection />
        </>
      )}
    </>
  )
}

export default IntegrationSettings
