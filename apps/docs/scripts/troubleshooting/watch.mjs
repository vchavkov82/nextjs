// @ts-check

import chokidar from 'chokidar'
import { closeSync, openSync, readFileSync, writeSync } from 'node:fs'
import { basename, join } from 'node:path'

const TROUBLESHOOTING_DIRECTORY = join(import.meta.dirname, '../../content/troubleshooting')

let __template = ''

function getTemplate() {
  if (!__template) {
    __template = readFileSync(join(TROUBLESHOOTING_DIRECTORY, '_template.mdx'), 'utf8')
  }
  return __template
}

let watcher

try {
  watcher = chokidar
    .watch(TROUBLESHOOTING_DIRECTORY, { ignoreInitial: true })
    .on('add', (path, stats) => {
      if (!stats?.isFile() || basename(path).startsWith('_')) return

      console.log(`File ${path} has been added.`)

      if (stats?.size !== 0) {
        console.log(`File ${path} already has content. Skipping template writing.`)
        return
      }

      try {
        console.log(`Writing template to ${path}...`)
        const fd = openSync(path, 'w')
        writeSync(fd, getTemplate())
        closeSync(fd)
      } catch (err) {
        console.error(`Error writing template to ${path}:`, err)
      }
    })
    .on('error', (err) => {
      console.error('Watcher error (non-fatal):', err)
      // Don't exit on watcher errors - keep the process alive
    })

  console.log(`Watching ${TROUBLESHOOTING_DIRECTORY} for new troubleshooting files...`)
} catch (err) {
  console.error('Failed to initialize watcher (non-fatal):', err)
  // Create a dummy watcher object to prevent crashes
  watcher = {
    close: () => Promise.resolve(),
  }
}

// Keep the process alive
const interval = setInterval(() => {}, 1000)

const shutdown = () => {
  console.log(`\nShutting down watcher...`)
  clearInterval(interval)
  if (watcher && typeof watcher.close === 'function') {
    watcher
      .close()
      .then(() => {
        console.log('Watcher closed. Exiting process.')
        process.exit(0)
      })
      .catch((err) => {
        console.error('Error closing watcher:', err)
        process.exit(1)
      })
  } else {
    process.exit(0)
  }
}

// Handle uncaught errors to prevent process from crashing
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception in watcher (non-fatal):', err)
  // Don't exit - keep the process alive
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection in watcher (non-fatal):', reason)
  // Don't exit - keep the process alive
})

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('SIGHUP', shutdown)
process.on('SIGQUIT', shutdown)
