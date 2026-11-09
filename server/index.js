import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createKommoLead, IntegrationError } from './kommo.js'

const rootDir = resolve(fileURLToPath(new URL('../', import.meta.url)))
const publicDir = resolve(rootDir, 'dist')
const MAX_BODY_BYTES = 16 * 1024
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT = 10
const rateBuckets = new Map()
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
}

function getAllowedOrigins(env) {
  const configured = env.ALLOWED_ORIGINS
  const origins = configured
    ? configured.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['https://devosoft-landing.devosoft.uz', 'http://localhost:5173', 'http://127.0.0.1:5173']

  return new Set(origins.map((origin) => new URL(origin).origin))
}

function sendJson(response, statusCode, body, origin) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...(origin ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    } : {}),
  })
  response.end(JSON.stringify(body))
}

async function readRequestBody(request) {
  const chunks = []
  let length = 0

  for await (const chunk of request) {
    length += chunk.length
    if (length > MAX_BODY_BYTES) {
      throw new IntegrationError('REQUEST_TOO_LARGE', 413)
    }
    chunks.push(chunk)
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new IntegrationError('INVALID_JSON', 400)
  }
}

function allowRequest(remoteAddress, now = Date.now()) {
  const previous = rateBuckets.get(remoteAddress)
  if (!previous || now - previous.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(remoteAddress, { startedAt: now, count: 1 })
    return true
  }

  previous.count += 1
  return previous.count <= RATE_LIMIT
}

function sendStaticFile(response, filePath) {
  const extension = extname(filePath).toLowerCase()
  response.writeHead(200, {
    'Content-Type': MIME_TYPES[extension] ?? 'application/octet-stream',
    'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  })
  createReadStream(filePath).pipe(response)
}

function serveFrontend(request, response) {
  if (!existsSync(publicDir)) {
    response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Production build is missing. Run npm run build first.')
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  } catch {
    response.writeHead(400)
    response.end()
    return
  }

  const relativePath = pathname.replace(/^\/+/, '')
  const requestedPath = resolve(publicDir, relativePath)
  if (requestedPath !== publicDir && !requestedPath.startsWith(`${publicDir}${sep}`)) {
    response.writeHead(400)
    response.end()
    return
  }

  const filePath = existsSync(requestedPath) && statSync(requestedPath).isFile()
    ? requestedPath
    : resolve(publicDir, 'index.html')
  if (!existsSync(filePath)) {
    response.writeHead(404)
    response.end()
    return
  }

  sendStaticFile(response, filePath)
}

export function createAppServer({ env = process.env, leadCreator = createKommoLead } = {}) {
  const allowedOrigins = getAllowedOrigins(env)

  return createServer(async (request, response) => {
    const requestUrl = new URL(request.url, 'http://localhost')

    if (requestUrl.pathname === '/healthz' && request.method === 'GET') {
      sendJson(response, 200, { status: 'ok' })
      return
    }

    if (requestUrl.pathname !== '/api/lead') {
      if (request.method === 'GET' || request.method === 'HEAD') {
        serveFrontend(request, response)
      } else {
        sendJson(response, 404, { code: 'NOT_FOUND' })
      }
      return
    }

    const origin = request.headers.origin
    const allowedOrigin = typeof origin === 'string' && allowedOrigins.has(origin) ? origin : null
    if (!allowedOrigin) {
      sendJson(response, 403, { code: 'ORIGIN_NOT_ALLOWED' })
      return
    }

    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600',
        Vary: 'Origin',
      })
      response.end()
      return
    }

    if (request.method !== 'POST') {
      sendJson(response, 405, { code: 'METHOD_NOT_ALLOWED' }, allowedOrigin)
      return
    }

    const contentType = request.headers['content-type'] ?? ''
    if (!contentType.toLowerCase().includes('application/json')) {
      sendJson(response, 415, { code: 'UNSUPPORTED_MEDIA_TYPE' }, allowedOrigin)
      return
    }

    const clientAddress = request.socket.remoteAddress ?? 'unknown'
    if (!allowRequest(clientAddress)) {
      sendJson(response, 429, { code: 'RATE_LIMITED' }, allowedOrigin)
      return
    }

    try {
      const payload = await readRequestBody(request)
      if (payload?.website) {
        sendJson(response, 400, { code: 'INVALID_LEAD' }, allowedOrigin)
        return
      }

      const result = await leadCreator(payload, env)
      sendJson(response, 201, { ok: true, leadId: result.leadId }, allowedOrigin)
    } catch (error) {
      const knownError = error instanceof IntegrationError
      const code = knownError ? error.code : 'INTERNAL_ERROR'
      const statusCode = knownError ? error.statusCode : 500
      console.error(`Lead API request failed: ${code}`)
      sendJson(response, statusCode, { code }, allowedOrigin)
    }
  })
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? '3000')
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('PORT must be a valid TCP port')
    process.exitCode = 1
  } else {
    const server = createAppServer()
    server.listen(port, '0.0.0.0', () => {
      console.log(`Devosoft survey server listening on port ${port}`)
    })
  }
}
