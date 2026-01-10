import { type ComponentPropsWithoutRef } from 'react'
import { Tabs as TabsClient, TabPanel as TabPanelClient } from './Tabs'

const Tabs = (props: ComponentPropsWithoutRef<typeof TabsClient>) => {
  return <TabsClient {...props} />
}

const TabPanel = (props: ComponentPropsWithoutRef<typeof TabPanelClient>) => {
  return <TabPanelClient {...props} />
}

export { Tabs, TabPanel }
