'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import {
  Children,
  isValidElement,
  useCallback,
  useMemo,
  useState,
  forwardRef,
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

// Wrapper component to properly forward refs to TabsPrimitive.List
type TabsListPropsWithClass = Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
  'className'
> & {
  className?: string
  class?: string
}
const TabsListWithRef = forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListPropsWithClass>(
  (props, ref) => {
    // Filter out 'class' prop to avoid React DOM warnings (should use 'className' instead)
    const { className, class: _class, ...restProps } = props
    return (
      <TabsPrimitive.List
        ref={ref}
        className={className}
        {...(restProps as Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>, 'className'>)}
      />
    )
  }
)
TabsListWithRef.displayName = TabsPrimitive.List.displayName || 'TabsListWithRef'

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
  // In React 19, refs are regular props (element.props.ref) and element.ref no longer exists
  // We safely extract only the props we need without accessing any ref properties
  const children = useMemo(() => {
    const childArray: Array<{
      id: string
      icon?: React.ReactNode
      label?: string
      iconRight?: React.ReactNode
    }> = []
    if (_children) {
      Children.forEach(_children, (child) => {
        // Use isValidElement to properly check for React elements in React 19
        if (isValidElement(child)) {
          // In React 19, we must access props through element.props (not element.ref)
          // Destructure only the props we need to avoid triggering ref access warnings
          const element = child as React.ReactElement<PanelProps>
          const { id, icon, label, iconRight } = element.props as PanelProps
          // Only include children with a valid id prop
          if (id && typeof id === 'string') {
            childArray.push({
              id,
              icon,
              label,
              iconRight,
            })
          }
        }
      })
    }
    return childArray
  }, [_children])

  const [activeTab, setActiveTab] = useState(
    activeId ??
      defaultActiveId ??
      // if no defaultActiveId is set use the first panel
      (Array.isArray(children) && children.length > 0 ? children[0].id : undefined)
  )

  useMemo(() => {
    if (activeId && activeId !== activeTab) setActiveTab(activeId)
  }, [activeId])

  let __styles = styleHandler('tabs')
  const variantStyles = __styles?.[type] ?? __styles?.pills

  function onTabClick(id: string) {
    onClick?.(id)
    if (id !== activeTab) {
      onChange?.(id)
      setActiveTab(id)
    }
  }

  const listClasses: string[] = []
  if (variantStyles?.list) listClasses.push(variantStyles.list)
  if (scrollable && __styles?.scrollable) listClasses.push(__styles.scrollable)
  if (wrappable && __styles?.wrappable) listClasses.push(__styles.wrappable)
  if (listClassNames) listClasses.push(listClassNames)

  // Normalize refs to handle both RefObject and callback refs
  const baseRefCallback = useCallback(
    (elem: HTMLDivElement | null) => {
      if (!refs?.base) return
      if (typeof refs.base === 'function') {
        refs.base(elem)
      } else if (refs.base && 'current' in refs.base) {
        // Use type assertion to allow assignment to RefObject.current
        // This is safe because we're forwarding the ref from Radix UI
        ;(refs.base as React.MutableRefObject<HTMLDivElement | null>).current = elem as HTMLDivElement | null
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
        // Use type assertion to allow assignment to RefObject.current
        // This is safe because we're forwarding the ref from Radix UI
        ;(refs.list as React.MutableRefObject<HTMLDivElement | null>).current = elem as HTMLDivElement | null
      }
    },
    [refs?.list]
  )

  const baseClasses: string[] = []
  if (__styles?.base) baseClasses.push(__styles.base)
  if (baseClassNames) baseClasses.push(baseClassNames)

  const listClassName = listClasses.join(' ').trim() || undefined
  const baseClassName = baseClasses.join(' ').trim() || undefined

  return (
    <TabsPrimitive.Root
      value={activeTab}
      className={baseClassName}
      ref={refs?.base ? baseRefCallback : undefined}
    >
      <TabsListWithRef className={listClassName} ref={refs?.list ? listRefCallback : undefined}>
        {addOnBefore}
        {Array.isArray(children) && children.length > 0
          ? children.map((tab) => {
              const isActive = activeTab === tab.id
              const triggerClasses: string[] = []
              if (variantStyles?.base) triggerClasses.push(variantStyles.base)
              if (__styles?.size?.[size]) triggerClasses.push(__styles.size[size])
              if (isActive && variantStyles?.active) {
                triggerClasses.push(variantStyles.active)
              } else if (!isActive && variantStyles?.inactive) {
                triggerClasses.push(variantStyles.inactive)
              }
              if (block && __styles?.block) {
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
            })
          : null}
        {addOnAfter}
      </TabsListWithRef>
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
