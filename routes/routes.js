import serveHtml from '../util/server/serve-html.js'
import postLogin from './post-login.js'
import getLogin from './get-login.js'
import postSignup from './post-signup.js'
import { postLogout } from './post-logout.js'
import { createRouter } from '../lib/router.js'
import { getSecure } from './get-secure.js'

const router = createRouter()

const paramsTest = (req, res, params) => {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.write(JSON.stringify(params))
  res.end()
}

router.add('get', '/', (req, res) => serveHtml('public/index.html', res))
router.add('get', '/users/:id/category', paramsTest)
router.add('get', '/users/:id/category/:theme', paramsTest)
router.add('get', '/users/:id', paramsTest)
router.add('get', '/about', (req, res) => serveHtml('public/about.html', res))

router.add('post', '/login', postLogin)
router.add('get', '/login', getLogin)

router.add('post', '/logout', postLogout)
router.add('post', '/signup', postSignup)

router.add('get', '/secure', getSecure)

export { router }