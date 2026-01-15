import Param from '~/components/Params'
import { genGuideMeta } from '~/features/docs/GuidesMdx.utils'
import { GuideTemplate, newEditLink } from '~/features/docs/GuidesMdx.template'
import { MDXRemoteBase } from '~/features/docs/MdxBase'
import specRealtimeV0 from '~/spec/realtime_v0_config.yaml' with { type: 'yml' }

const meta = {
  title: 'Realtime Self-hosting Config',
  description: 'How to configure and deploy BA Realtime.',
}

const generateMetadata = genGuideMeta(() => ({
  pathname: '/guides/self-hosting/realtime/config',
  meta,
}))

const RealtimeConfigPage = async () => {
  const descriptionMdx = specRealtimeV0.info.description
  const tags = specRealtimeV0.info.tags
  const parameters = specRealtimeV0.parameters

  return (
    <GuideTemplate
      meta={meta}
      editLink={newEditLink(
        'supabase/supabase/blob/master/apps/docs/app/guides/(with-sidebar)/self-hosting/realtime/config/page.tsx'
      )}
    >
      <MDXRemoteBase source={descriptionMdx} />

      <div>
        {tags.map((tag: any) => {
          return (
            <div key={tag.id}>
              <h2 className="text-foreground">{tag.title}</h2>
              <p className="text-foreground-lighter">{tag.description}</p>
              <div className="not-prose">
                <h5 className="text-base text-foreground mb-3">Parameters</h5>
                <ul>
                  {parameters
                    .filter((param: any) =>
                      param.tags.includes(tag.id)
                    )
                    .map((param: any) => {
                      return (
                        <Param
                          key={param.title}
                          name={param.title}
                          type={param.type}
                          description={param.description}
                          isOptional={!param.required}
                        />
                      )
                    })}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </GuideTemplate>
  )
}

export default RealtimeConfigPage
export { generateMetadata }
