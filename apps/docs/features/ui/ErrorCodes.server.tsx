import { type ComponentPropsWithoutRef } from 'react'
import { ErrorCodes as ErrorCodesClient } from './ErrorCodes'

const ErrorCodes = (props: ComponentPropsWithoutRef<typeof ErrorCodesClient>) => {
  return <ErrorCodesClient {...props} />
}

export { ErrorCodes }
