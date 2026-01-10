import { type ComponentProps } from 'react'
import { Tabs as TabsClient, TabPanel as TabPanelClient } from './Tabs'

const Tabs = (props: ComponentProps<typeof TabsClient>) => {
  return <TabsClient {...props} />
}

const TabPanel = (props: ComponentProps<typeof TabPanelClient>) => {
  return <TabPanelClient {...props} />
}

export { Tabs, TabPanel }
