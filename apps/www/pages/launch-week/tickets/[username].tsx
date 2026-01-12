import { GetStaticPaths, GetStaticProps } from 'next'
import dayjs from 'dayjs'
import { SITE_ORIGIN } from '@/lib/constants'

const Lw15Page = () => {
  return <div>Ticket page - Supabase disabled</div>
}

export default Lw15Page

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const username = params?.username?.toString() || null

  return {
    props: {
      username,
      ogImageUrl: '',
      user: null,
    },
    revalidate: 3600,
  }
}
