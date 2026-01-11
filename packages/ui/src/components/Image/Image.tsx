'use client'

import 'react-medium-image-zoom/dist/styles.css'

import NextImage, { type ImageProps as NextImageProps } from 'next/image'
import { cn } from '../../lib/utils'
import Zoom from 'react-medium-image-zoom'
import ZoomContent from './ZoomContent'

export type CaptionAlign = 'left' | 'center' | 'right'
export interface StaticImageData {
  src: string
  height: number
  width: number
  blurDataURL?: string
  blurWidth?: number
  blurHeight?: number
}

export interface StaticRequire {
  default: StaticImageData
}
export type StaticImport = StaticRequire | StaticImageData

export type SourceType =
  | string
  | {
    dark: string | StaticImport
    light: string | StaticImport
  }

export interface ImageProps extends Omit<NextImageProps, 'src'> {
  src: SourceType
  zoomable?: boolean
  caption?: string
  captionAlign?: CaptionAlign
  containerClassName?: string
}

/**
 * An advanced Image component that extends next/image with:
 * - src: prop can either be a string or an object with theme alternatives {dark: string, light: string}
 * - zoomable: {boolean} (optional) to make the image zoomable on click
 * - caption: {string} (optional) to add a figcaption
 * - captionAlign: {'left' | 'center' | 'right'} (optional) to align the caption
 * - containerClassName: {string} (optional) to style the parent container (<figure> when caption exists, <div> otherwise)
 */
const Image = ({ src, alt = '', zoomable, containerClassName, caption, captionAlign, ...props }: ImageProps) => {
  const Component = zoomable ? Zoom : 'span'
  const sizes = zoomable
    ? '(max-width: 768px) 200vw, (max-width: 1200px) 120vw, 200vw'
    : '(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 33vw'

  // Use fixed zoomMargin to prevent hydration mismatch
  const zoomMargin = 80

  // For themed images, render both and use CSS to show/hide based on theme
  // This prevents hydration mismatches since the HTML is identical on server and client
  const isThemedImage = typeof src !== 'string'

  // Use <figure> only when there's a caption (semantically correct and avoids DOM nesting issues in <p> tags)
  const Wrapper = caption ? 'figure' : 'div'

  // Filter out custom props that shouldn't be passed to NextImage
  const { wide, ...nextImageProps } = props as ImageProps & { wide?: boolean }

  if (isThemedImage) {
    return (
      <Wrapper className={cn('next-image--dynamic-fill', containerClassName)}>
        <Component
          {...(zoomable
            ? { ZoomContent: ZoomContent, zoomMargin }
            : undefined)}
        >
          <NextImage
            alt={alt}
            src={src.light}
            sizes={sizes}
            {...nextImageProps}
            className={cn(nextImageProps.className, 'dark:hidden')}
            style={nextImageProps.style}
          />
          <NextImage
            alt={alt}
            src={src.dark}
            sizes={sizes}
            {...nextImageProps}
            className={cn(nextImageProps.className, 'hidden dark:block')}
            style={nextImageProps.style}
          />
        </Component>
        {caption && (
          <figcaption className={cn(getCaptionAlign(captionAlign))}>{caption}</figcaption>
        )}
      </Wrapper>
    )
  }

  return (
    <Wrapper className={cn('next-image--dynamic-fill', containerClassName)}>
      <Component
        {...(zoomable
          ? { ZoomContent: ZoomContent, zoomMargin }
          : undefined)}
      >
        <NextImage
          alt={alt}
          src={src}
          sizes={sizes}
          {...nextImageProps}
        />
      </Component>
      {caption && (
        <figcaption className={cn(getCaptionAlign(captionAlign))}>{caption}</figcaption>
      )}
    </Wrapper>
  )
}

const getCaptionAlign = (align?: CaptionAlign) => {
  switch (align) {
    case 'left':
      return 'text-left'
    case 'right':
      return 'text-right'
    case 'center':
    default:
      return 'text-center'
  }
}

export default Image
