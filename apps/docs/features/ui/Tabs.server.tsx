import { type ComponentPropsWithoutRef } from 'react'
import { Tabs as TabsPrimitive, Panel } from 'ui'

// Use the primitive Tabs directly for MDX to avoid hydration issues
// The withQueryParams HOC in ./Tabs causes hydration mismatches due to URL param reading
const Tabs = (props: ComponentPropsWithoutRef<typeof TabsPrimitive>) => {
  return <TabsPrimitive wrappable {...props} />
}

// Import Panel directly as a named export to avoid property access serialization issues
// (same pattern as Accordion/AccordionItem)
const TabPanel = Panel

export { Tabs, TabPanel }
