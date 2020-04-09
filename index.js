import http from 'http'
import pathParser from 'path'
import urlParser from 'url'
import { requestHandler } from './lib/router.js'
import { staticRouter } from './lib/static-server.js'
import { router } from './routes/routes.js'

const port = parseInt(process.argv[2]) || 8080
const publicDir = 'public/'

const server = http.createServer()

server.on('request', (req, res) => {
  const url = urlParser.parse(req.url, true)
  const path = pathParser.join(process.cwd(), publicDir, url.pathname)

  if (pathParser.extname(path)) {
    staticRouter(publicDir, req, res)
  } else {
    requestHandler(router, req, res)
  }

  req.on('error', err => {
    console.error(err)
  })

  res.on('error', err => {
    console.error(err)
  })
})

server.listen(port)