export interface Theme {
  name: string
  value: string
}

export const themes = [
  { name: 'System', value: 'system' }, // Switches between dark and light
  { name: 'Dark', value: 'dark' }, // Classic BA dark
  { name: 'Classic dark', value: 'classic-dark' }, // Deep Dark BA dark
  { name: 'Light', value: 'light' }, // Classic BA light
]
