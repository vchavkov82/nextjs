import { type ComponentPropsWithoutRef } from 'react'
import { Accordion as AccordionClient, AccordionItem as AccordionItemClient } from './Accordion'

const Accordion = (props: ComponentPropsWithoutRef<typeof AccordionClient>) => {
  return <AccordionClient {...props} />
}

const AccordionItem = (props: ComponentPropsWithoutRef<typeof AccordionItemClient>) => {
  return <AccordionItemClient {...props} />
}

export { Accordion, AccordionItem }
