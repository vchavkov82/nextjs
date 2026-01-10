'use client'

import { Accordion as AccordionPrimitive, Item } from 'ui'

/**
 * This makes the component work in MDX files, which otherwise would error on
 * "trying to dot into a Client Component".
 * 
 * Note: We import Item separately as a named export to avoid serialization
 * issues during static generation where property access (Accordion.Item) can
 * result in objects instead of component functions.
 */

const Accordion = AccordionPrimitive
// Import Item directly as a named export to avoid property access serialization issues
const AccordionItem = Item

export { Accordion, AccordionItem }
