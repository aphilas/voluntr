import { readCookies } from '../lib/cookies.js'

export default function(req, res) {

  const cookies = readCookies(req)

  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.write('Log In page')
  res.end()
}