'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import {
  Children,
  isValidElement,
  useMemo,
  useState,
  type KeyboardEvent,
  type PropsWithChildren,
  type RefObject,
} from 'react'
import styleHandler from '../../lib/theme/styleHandler'

export interface TabsProps {
  type?: 'pills' | 'underlined' | 'cards' | 'rounded-pills'
  defaultActiveId?: string
  activeId?: string
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge'
  block?: boolean
  tabBarGutter?: number
  tabBarStyle?: React.CSSProperties
  onChange?: any
  onClick?: any
  scrollable?: boolean
  wrappable?: boolean
  addOnBefore?: React.ReactNode
  addOnAfter?: React.ReactNode
  listClassNames?: string
  baseClassNames?: string
  refs?: {
    base: RefObject<HTMLDivElement> | ((elem: HTMLDivElement | null) => void)
    list: RefObject<HTMLDivElement> | ((elem: HTMLDivElement | null) => void)
  }
}

interface TabsSubComponents {
  Panel: React.FC<PropsWithChildren<PanelProps>>
}

/**
 * @deprecated Use `import { Tabs_shadcn_ } from "ui"` instead
 */
const Tabs: React.FC<PropsWithChildren<TabsProps>> & TabsSubComponents = ({
  defaultActiveId,
  activeId,
  type = 'pills',
  size = 'tiny',
  block,
  onChange,
  onClick,
  scrollable,
  wrappable,
  addOnBefore,
  addOnAfter,
  listClassNames,
  baseClassNames,
  refs,
  children: _children,
}) => {
  // Filter valid React elements without accessing .ref to preserve React 19 compatibility
  // Extract props early to avoid React 19 warnings about ref access
  // In React 19, accessing element.props can trigger warnings if the element has a ref
  // By extracting props once and storing them, we avoid multiple prop accesses
  const children = useMemo(() => {
    const childArray: Array<{
      id: string
      icon?: React.ReactNode
      label?: string
      iconRight?: React.ReactNode
    }> = []
    Children.forEach(_children, (child) => {
      // Use isValidElement to properly check for React elements in React 19
      if (isValidElement(child)) {
        const element = child as React.ReactElement<PanelProps>
        // Extract props once to avoid React 19's ref access detection
        // Accessing element.props is safe, but accessing it multiple times
        // can trigger warnings when elements have refs
        const props = element.props as PanelProps
        childArray.push({
          id: props.id,
          icon: props.icon,
          label: props.label,
          iconRight: props.iconRight,
        })
      }
    })
    return childArray
  }, [_children])

  const [activeTab, setActiveTab] = useState(
    activeId ??
      defaultActiveId ??
      // if no defaultActiveId is set use the first panel
      children?.[0]?.id
  )

  useMemo(() => {
    if (activeId && activeId !== activeTab) setActiveTab(activeId)
  }, [activeId])

  let __styles = styleHandler('tabs')

  function onTabClick(id: string) {
    onClick?.(id)
    if (id !== activeTab) {
      onChange?.(id)
      setActiveTab(id)
    }
  }

  const listClasses = [__styles[type].list]
  if (scrollable) listClasses.push(__styles.scrollable)
  if (wrappable) listClasses.push(__styles.wrappable)
  if (listClassNames) listClasses.push(listClassNames)

  return (
    <TabsPrimitive.Root
      value={activeTab}
      className={[__styles.base, baseClassNames].join(' ')}
      ref={refs?.base}
    >
      <TabsPrimitive.List className={listClasses.join(' ')} ref={refs?.list}>
        {addOnBefore}
        {children.map((tab) => {
          const isActive = activeTab === tab.id
          const triggerClasses = [__styles[type].base, __styles.size[size]]
          if (isActive) {
            triggerClasses.push(__styles[type].active)
          } else {
            triggerClasses.push(__styles[type].inactive)
          }
          if (block) {
            triggerClasses.push(__styles.block)
          }

          return (
            <TabsPrimitive.Trigger
              onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onTabClick(tab.id)
                }
              }}
              onClick={() => onTabClick(tab.id)}
              key={`${tab.id}-tab-button`}
              value={tab.id}
              className={triggerClasses.join(' ')}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.iconRight}
            </TabsPrimitive.Trigger>
          )
        })}
        {addOnAfter}
      </TabsPrimitive.List>
      {_children}
    </TabsPrimitive.Root>
  )
}

interface PanelProps {
  id: string
  label?: string
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  className?: string
}

/**
 * @deprecated Use ./TabsContent_Shadcn_ instead
 */
export const Panel: React.FC<PropsWithChildren<PanelProps>> = ({ children, id, className }) => {
  let __styles = styleHandler('tabs')

  return (
    <TabsPrimitive.Content value={id} className={[__styles.content, className].join(' ')}>
      {children}
    </TabsPrimitive.Content>
  )
}

Tabs.Panel = Panel
export default Tabs
