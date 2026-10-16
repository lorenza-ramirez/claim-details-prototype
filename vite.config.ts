import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Connect, type Plugin } from 'vite'

/**
 * Per-user preferences API for the prototype, stored as JSON on the dev machine.
 * GET / PUT / DELETE /api/users/:userId/preferences/:key
 */
function userPreferencesApi(): Plugin {
  const storeFile = fileURLToPath(new URL('./.local-data/user-preferences.json', import.meta.url))
  const route = /^\/api\/users\/([A-Za-z0-9-]{1,64})\/preferences\/([A-Za-z0-9-]{1,64})$/
  const maxBodyBytes = 64 * 1024
  type Store = Record<string, Record<string, unknown>>
  let writeQueue: Promise<unknown> = Promise.resolve()

  async function readStore(): Promise<Store> {
    try {
      const parsed: unknown = JSON.parse(await readFile(storeFile, 'utf8'))
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Store) : {}
    } catch {
      return {}
    }
  }

  function updateStore(change: (store: Store) => void) {
    const run = writeQueue.then(async () => {
      const store = await readStore()
      change(store)
      await mkdir(dirname(storeFile), { recursive: true })
      const tempFile = `${storeFile}.tmp`
      await writeFile(tempFile, JSON.stringify(store, null, 2))
      await rename(tempFile, storeFile)
    })
    writeQueue = run.catch(() => undefined)
    return run
  }

  function readBody(req: IncomingMessage) {
    return new Promise<string>((resolve, reject) => {
      let size = 0
      const chunks: Buffer[] = []
      req.on('data', (chunk: Buffer) => {
        size += chunk.length
        if (size > maxBodyBytes) {
          reject(new Error('Payload too large'))
          req.destroy()
          return
        }
        chunks.push(chunk)
      })
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      req.on('error', reject)
    })
  }

  function send(res: ServerResponse, status: number, body?: unknown) {
    res.statusCode = status
    if (body === undefined) {
      res.end()
      return
    }
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
  }

  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const match = route.exec((req.url ?? '').split('?')[0])
    if (!match) {
      next()
      return
    }
    const [, userId, key] = match
    const handle = async () => {
      if (req.method === 'GET') {
        const store = await readStore()
        const prefs = Object.hasOwn(store, userId) ? store[userId] : {}
        if (Object.hasOwn(prefs, key)) send(res, 200, prefs[key])
        else send(res, 404, { error: 'Not found' })
      } else if (req.method === 'PUT') {
        const value: unknown = JSON.parse(await readBody(req))
        await updateStore((store) => {
          const prefs = Object.hasOwn(store, userId) ? store[userId] : {}
          store[userId] = { ...prefs, [key]: value }
        })
        send(res, 204)
      } else if (req.method === 'DELETE') {
        await updateStore((store) => {
          if (!Object.hasOwn(store, userId)) return
          const prefs = { ...store[userId] }
          delete prefs[key]
          store[userId] = prefs
        })
        send(res, 204)
      } else {
        send(res, 405, { error: 'Method not allowed' })
      }
    }
    handle().catch((error: unknown) => {
      send(res, error instanceof SyntaxError ? 400 : 500, { error: 'Could not save preference' })
    })
  }

  return {
    name: 'user-preferences-api',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), userPreferencesApi()],
  server: {
    // Bind IPv4 explicitly: browsers resolve localhost to 127.0.0.1, and the
    // default binding can end up IPv6-only (::1), which refuses those requests.
    host: '127.0.0.1',
    watch: {
      usePolling: true,
      ignored: ['**/.local-data/**'],
    },
  },
})
