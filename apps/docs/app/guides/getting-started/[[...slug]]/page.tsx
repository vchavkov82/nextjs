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

const GettingStartedGuidePage = async (props: { params: Promise<Params> }) => {
  const params = await props.params
  const slug = ['getting-started', ...(params.slug ?? [])]
  const data = await getGuidesMarkdown(slug)

  if (!data) {
    notFound()
  }

  const { pathname, ...guideProps } = data
  return <GuideTemplate {...guideProps} /> 
}

const generateStaticParams = IS_PROD ? genGuidesStaticParams('getting-started') : getEmptyArray
const generateMetadata = genGuideMeta((params: { slug?: string[] }) =>
  getGuidesMarkdown(['getting-started', ...(params.slug ?? [])])
)

export default GettingStartedGuidePage
export { generateStaticParams, generateMetadata }
