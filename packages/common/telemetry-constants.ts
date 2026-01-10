/**
 * Telemetry constants stub - provides minimal types and constants
 * External telemetry has been removed, but some internal types are still needed
 */

export enum TABLE_EVENT_ACTIONS {
  TableCreated = 'table_created',
  TableDataAdded = 'table_data_added',
  TableRLSEnabled = 'table_rls_enabled',
}

export type TableEventAction = TABLE_EVENT_ACTIONS

export interface ImportDataFileDroppedEvent {
  action: 'import_data_dropzone_file_added'
  properties?: Record<string, unknown>
  groups?: Record<string, string>
}

export interface StudioPricingSidePanelOpenedEvent {
  action: string
  properties?: Record<string, unknown>
  groups?: Record<string, string>
}

export interface CommandMenuOpenedEvent {
  action: 'command_menu_opened'
  properties: {
    trigger_type: 'keyboard_shortcut' | 'search_input'
    trigger_location?: string
    location?: string
    app: 'studio' | 'docs' | 'www'
  }
  groups: Record<string, string>
}

export interface CommandMenuCommandClickedEvent {
  action: 'command_menu_command_clicked'
  properties: {
    command_id: string
    app: 'studio' | 'docs' | 'www'
  }
  groups: Record<string, string>
}

export interface CommandMenuSearchSubmittedEvent {
  action: 'command_menu_search_submitted'
  properties: {
    query: string
    app: 'studio' | 'docs' | 'www'
  }
  groups: Record<string, string>
}
