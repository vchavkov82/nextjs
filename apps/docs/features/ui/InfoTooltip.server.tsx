import { type ComponentPropsWithoutRef } from 'react'
import InfoTooltipClient from './InfoTooltip'

const InfoTooltip = (props: ComponentPropsWithoutRef<typeof InfoTooltipClient>) => {
  return <InfoTooltipClient {...props} />
}

export default InfoTooltip
