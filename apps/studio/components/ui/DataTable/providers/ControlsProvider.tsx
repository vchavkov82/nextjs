import { useLocalStorage } from 'hooks/misc/useLocalStorage'
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'

interface ControlsContextType {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const ControlsContext = createContext<ControlsContextType | null>(null)

const DEFAULT_CONTROLS_OPEN = true

export function ControlsProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const [localStorageValue, setLocalStorageValue] = useLocalStorage('data-table-controls', DEFAULT_CONTROLS_OPEN)

  // Use default value during SSR and initial render to avoid hydration mismatch
  // Only use localStorage value after hydration is complete
  const open = isMounted ? localStorageValue : DEFAULT_CONTROLS_OPEN

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <ControlsContext.Provider value={{ open, setOpen: setLocalStorageValue }}>
      <div
        // REMINDER: access the data-expanded state with tailwind via `group-data-[expanded=true]/controls:block`
        // In tailwindcss v4, we could even use `group-data-expanded/controls:block`
        className="group/controls h-full"
        data-expanded={open}
      >
        {children}
      </div>
    </ControlsContext.Provider>
  )
}

export function useControls() {
  const context = useContext(ControlsContext)

  if (!context) {
    throw new Error('useControls must be used within a ControlsProvider')
  }

  return context as ControlsContextType
}
