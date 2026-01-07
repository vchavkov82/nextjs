import {
  getGuidesMarkdown,
  genGuideMeta,
  genGuidesStaticParams,
} from '~/features/docs/GuidesMdx.utils'
import { GuideTemplate } from '~/features/docs/GuidesMdx.template'
import { IS_PROD } from 'common/constants'
import { getEmptyArray } from '~/features/helpers.fn'
import { notFound } from 'next/navigation'

type Params = { slug?: string[] }

const LocalDevelopmentGuidePage = async (props: { params: Promise<Params> }) => {
  const params = await props.params
  const slug = ['local-development', ...(params.slug ?? [])]
  const data = await getGuidesMarkdown(slug)

  if (!data) {
    notFound()
  }

  const { pathname, ...guideProps } = data
  return <GuideTemplate {...(guideProps as Parameters<typeof GuideTemplate>[0])} />
}

const generateStaticParams = IS_PROD ? genGuidesStaticParams('local-development') : getEmptyArray
const generateMetadata = genGuideMeta((params: { slug?: string[] }) =>
  getGuidesMarkdown(['local-development', ...(params.slug ?? [])])
)

export default LocalDevelopmentGuidePage
export { generateStaticParams, generateMetadata }
