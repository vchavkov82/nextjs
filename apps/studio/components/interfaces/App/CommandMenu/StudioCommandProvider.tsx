import type { PropsWithChildren } from 'react'

import { CommandProvider } from 'ui-patterns/CommandMenu'
import { useLocalStorageQuery } from 'hooks/misc/useLocalStorage'
import { LOCAL_STORAGE_KEYS } from 'common'

export function StudioCommandProvider({ children }: PropsWithChildren) {
  const [commandMenuHotkeyEnabled] = useLocalStorageQuery<boolean>(
    LOCAL_STORAGE_KEYS.HOTKEY_COMMAND_MENU,
    true
  )

  return (
    <CommandProvider
      app="studio"
      openKey={commandMenuHotkeyEnabled ? 'k' : ''}
    >
      {children}
    </CommandProvider>
  )
}
