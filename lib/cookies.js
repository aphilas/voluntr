
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
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join(';')
}

const readCookies = req => {
  return parseCookies(req.headers.cookie)
}

/**
 * Set cookies to response 
 * @param {Object} cookies Key-value dictionary of cookies
 * @param {Object} res Response object
 */
const setCookies = (cookies, res) => {
  const cookieString = stringifyCookies(cookies)

  res.writeHead(200, {
    'Set-Cookie': `${cookieString}`
  })
}

export { readCookies, setCookies }