import { setHeaders } from './server.js'

const parseCookies = cookie => {
  if (!cookie) return {}

  const regex = /([^;=\s]*)=([^;]*)/g
  const cookieObj = {}

  for (let m; m = regex.exec(cookie);) {
    cookieObj[m[1]] = decodeURIComponent(m[2])
  }

  return cookieObj
}

const stringifyCookies = cookies => {
  return Object.entries(cookies)
    .map(([key, value]) => `${key}=${ encodeURIComponent(value)}`).join(';')
}

const readCookies = req => {
  return parseCookies(req.headers.cookie)
}

const defaultOptions = {
  // path:'/',
  // domain: 'host.com',
  maxAge: 3600 * 24,
  // expires: new Date().toUTCString(), 
  // secure: true,
  // samesite: 'strict', // | lax
}

const optionsString = options => {
  let str  = ''
  const opts = [ 'path', 'domain', 'maxAge', 'expires', 'samesite' ]

  for (const opt of opts) {
    if (options[opt] && opt == 'maxAge') {
      str += `;max-age=${options[opt]}`
    } else if (options[opt]) {
      str += `;${opt}=${options[opt]}`
    }
  }

  if (options.secure) str += ';secure'

  return str
}

/**
 * Set cookies to response 
 * @param {Response} res Response object
 * @param {Object} cookies Key-value dictionary of cookies
 */
const setCookies = (res, cookies, options = defaultOptions) => {
  // max-age: seconds

  const cookieString = stringifyCookies(cookies) + optionsString(options)
  setHeaders(res, { setCookie: `${cookieString}` })
}

/**
 * Clears cookies from a response - not tested
 * @param {Response} res 
 * @param {string[]} keys Array of cookie keys
 */
const clearCookies = (res, keys) => {
  keys.forEach(key => {
    const str = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    setHeaders(res, `setCookie: ${str}`)
  })
}

export { readCookies, setCookies, clearCookies }