import { type ComponentPropsWithoutRef } from 'react'
import { Price as PriceClient } from './Price'

const Price = (props: ComponentPropsWithoutRef<typeof PriceClient>) => {
  return <PriceClient {...props} />
}

export { Price }
