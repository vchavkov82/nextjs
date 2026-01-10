import { type Metadata } from 'next'

export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Not found',
}
