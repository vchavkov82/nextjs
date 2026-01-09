import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { Button } from 'ui'
import ProductIcon from '../ProductIcon'
import { BookOpen } from 'lucide-react'
import { useSendTelemetryEvent } from '@/lib/telemetry'

type subheader = string
interface Types {
  h1: string | ReactNode
  subheader: (string | ReactNode)[]
  icon?: string
  title?: string
  image?: ReactNode | ReactNode[]
  footer?: ReactNode
  documentation_url?: string
  callout?: ReactNode
}

const ProductHeader = (props: Types) => {
  const sendTelemetryEvent = useSendTelemetryEvent()
  return (
    <div className="container relative mx-auto px-6 pt-16 pb-0 sm:px-16 lg:pt-28 xl:px-20">
      <div className="grid grid-cols-12">
        <div className="col-span-12 space-y-8 lg:col-span-5">
          {props.callout && props.callout}
          <div>
            {props.icon || props.title ? (
              <div className="mb-4 flex items-center gap-3">
                {props.icon && <ProductIcon icon={props.icon} />}
                {props.title && (
                  <span className="text-foreground">
                    {props.title}
                  </span>
                )}
              </div>
            ) : null}
            <h1 className="h1">
              {props.h1}
            </h1>
          </div>
          <div>
            {props.subheader &&
              props.subheader.map((subheader, i) => {
                return (
                  <p className="p lg:text-lg" key={`subheader-${i}`}>
                    {subheader}
                  </p>
                )
              })}
          </div>
          <div className="flex flex-row md:flex-row md:items-center">
            <Button asChild size="medium">
              <Link
                href="https://www.assistance.bg/dashboard"
                as="https://www.assistance.bg/dashboard"
                onClick={() =>
                  sendTelemetryEvent({
                    action: 'start_project_button_clicked',
                    properties: { buttonLocation: 'Product Page Header - ' + props.title },
                  })
                }
              >
                Start a project
              </Link>
            </Button>
            {props.documentation_url && (
              <Button asChild type="default" size="medium" icon={<BookOpen />}>
                <Link
                  href={props.documentation_url}
                  as={props.documentation_url}
                  className="ml-2"
                  onClick={() =>
                    sendTelemetryEvent({
                      action: 'see_documentation_button_clicked',
                      properties: {
                        buttonLocation: 'Product Page Header - ' + props.title,
                      },
                    })
                  }
                >
                  See documentation
                </Link>
              </Button>
            )}
          </div>
          {props.footer && <div className="mb-4">{props.footer}</div>}
        </div>
        {props.image && (
          <div className="col-span-12 mt-8 lg:col-span-7 lg:mt-0 xl:col-span-6 xl:col-start-7">
            {Array.isArray(props.image)
              ? props.image.map((img, i) => (
                  <Fragment key={i}>{img}</Fragment>
                ))
              : props.image}
          </div>
        )}
      </div>
    </div>
  )
}
export default ProductHeader
