import { BookOpenText } from 'lucide-react'
import { useParams } from 'common'
import { useSelectedOrganizationQuery } from 'hooks/misc/useSelectedOrganization'
import { useAppStateSnapshot } from 'state/app-state'
import { ButtonTooltip } from './ButtonTooltip'

interface APIDocsButtonProps {
  section?: string[]
  source: string
}

export const APIDocsButton = ({ section, source }: APIDocsButtonProps) => {
  const snap = useAppStateSnapshot()
  const { ref } = useParams()
  const { data: org } = useSelectedOrganizationQuery()

  return (
    <ButtonTooltip
      size="tiny"
      type="default"
      onClick={() => {
        if (section) snap.setActiveDocsSection(section)
        snap.setShowProjectApiDocs(true)

        sendEvent({
          action: 'api_docs_opened',
          properties: {
            source,
          },
          groups: {
            project: ref ?? 'Unknown',
            organization: org?.slug ?? 'Unknown',
          },
        })
      }}
      icon={<BookOpenText />}
      className="h-7 w-7"
      tooltip={{
        content: {
          side: 'bottom',
          text: 'API Docs',
        },
      }}
    />
  )
}
