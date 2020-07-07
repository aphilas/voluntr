import { loadEnv } from './env.js'
loadEnv()

import http from 'http'
import pathParser from 'path'
import urlParser from 'url'
import { staticServer } from './lib/server.js'
import { router } from './routes/routes.js'

const port = parseInt(process.argv[2]) || 8080
const publicDir = 'public/'

const server = http.createServer()

server.on('request', (req, res) => {
  const url = urlParser.parse(req.url, true)
  const path = pathParser.join(process.cwd(), publicDir, url.pathname)

  if (pathParser.extname(path)) {
    staticServer(publicDir, req, res)
  } else {
    router.handle(req, res)
  }

  req.on('error', err => {
    console.error(err)
  })

  res.on('error', err => {
    console.error(err)
  })
})

server.listen(port)
console.info(`Server started on: http://localhost:${port}`)