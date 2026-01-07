'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import {
  Children,
  isValidElement,
  useCallback,
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
  // Extract tab information from Panel children
  // In React 19, we must access props through element.props (not element.ref)
  // We use a defensive approach to avoid triggering React 19's ref access warnings
  const children = useMemo(() => {
    const childArray: Array<{
      id: string
      icon?: React.ReactNode
      label?: string
      iconRight?: React.ReactNode
    }> = []

    Children.forEach(_children, (child) => {
      if (!isValidElement(child)) return

      // In React 19, refs are regular props accessible via element.props.ref
      // We only access the props we need (id, icon, label, iconRight) and explicitly
      // avoid accessing any ref property. Access props in a single destructuring to
      // minimize React's internal ref detection warnings.
      const element = child as React.ReactElement<PanelProps>
      // Access props object once - React 19 way (not element.ref)
      const { id, icon, label, iconRight } = element.props || {}
      
      if (id) {
        childArray.push({ id, icon, label, iconRight })
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
  const variantStyles = __styles[type] ?? __styles.pills

  function onTabClick(id: string) {
    onClick?.(id)
    if (id !== activeTab) {
      onChange?.(id)
      setActiveTab(id)
    }
  }

  const listClasses = [variantStyles.list]
  if (scrollable) listClasses.push(__styles.scrollable)
  if (wrappable) listClasses.push(__styles.wrappable)
  if (listClassNames) listClasses.push(listClassNames)

  // Normalize refs to handle both RefObject and callback refs
  const baseRefCallback = useCallback(
    (elem: HTMLDivElement | null) => {
      if (!refs?.base) return
      if (typeof refs.base === 'function') {
        refs.base(elem)
      } else if (refs.base && 'current' in refs.base) {
        ;(refs.base as RefObject<HTMLDivElement>).current = elem
      }
    },
    [refs?.base]
  )

  const listRefCallback = useCallback(
    (elem: HTMLDivElement | null) => {
      if (!refs?.list) return
      if (typeof refs.list === 'function') {
        refs.list(elem)
      } else if (refs.list && 'current' in refs.list) {
        ;(refs.list as RefObject<HTMLDivElement>).current = elem
      }
    },
    [refs?.list]
  )

  return (
    <TabsPrimitive.Root
      value={activeTab}
      className={[__styles.base, baseClassNames].join(' ')}
      ref={refs?.base ? baseRefCallback : undefined}
    >
      <TabsPrimitive.List className={listClasses.join(' ')} ref={refs?.list ? listRefCallback : undefined}>
        {addOnBefore}
        {children.map((tab) => {
          const isActive = activeTab === tab.id
          const triggerClasses = [variantStyles.base, __styles.size[size]]
          if (isActive) {
            triggerClasses.push(variantStyles.active)
          } else {
            triggerClasses.push(variantStyles.inactive)
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
