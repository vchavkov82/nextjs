const { defineConfig } = require('eslint/config')
const supabaseConfig = require('eslint-config-supabase/next')

module.exports = defineConfig([
  supabaseConfig,
  {
    files: ['examples/**'],
    rules: {
      '@next/next/no-sync-scripts': 'off',
      '@next/next/no-head-element': 'off',
    },
  },
  {
    ignores: ['examples/**/angular-user-management/**'],
  },
])
