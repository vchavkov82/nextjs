'use client'

import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { CH } from '@code-hike/mdx/components'
import { Admonition } from 'ui-patterns/admonition'

/**
 * Returns custom components so that the markdown converts to a nice looking html.
 */
function mdxComponents(callback: Dispatch<SetStateAction<string | null>>) {
  const components = {
    CH,
    Admonition,
    /**
     * Returns a custom img element which has a bound onClick listener. When the image is clicked, it will open a modal showing that particular image.
     */
    img: (
      props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
    ) => {
      return <img {...props} onClick={() => callback(props.src!)} />
    },
  }

  return components
}

interface PartnerOverviewProps {
  slug: string
  onImageClick: Dispatch<SetStateAction<string | null>>
}

export function PartnerOverview({ slug, onImageClick }: PartnerOverviewProps) {
  const [overview, setOverview] = useState<MDXRemoteSerializeResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOverview() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/partners/integrations/${slug}/overview`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch overview')
        }

        const data = await response.json()
        setOverview(data.overview)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load overview')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOverview()
  }, [slug])

  if (isLoading) {
    return (
      <div className="prose">
        <div className="animate-pulse">
          <div className="h-4 bg-surface-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-surface-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-surface-200 rounded w-5/6 mb-4"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="prose">
        <p className="text-foreground-lighter">Failed to load overview. Please try refreshing the page.</p>
      </div>
    )
  }

  if (!overview) {
    return null
  }

  return (
    <div className="prose">
      <MDXRemote {...overview} components={mdxComponents(onImageClick)} />
    </div>
  )
}
