import { GetStaticPaths, GetStaticProps } from 'next'
import Error404 from '../404'

function PartnerPage() {
  return <Error404 />
}

// Supabase removed - no dynamic partner pages available
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

// Supabase removed - return not found
export const getStaticProps: GetStaticProps = async ({ params }) => {
  return {
    notFound: true,
  }
}

export default PartnerPage
