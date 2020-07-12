import { parseRequestJson } from '../lib/parse-request.js'
import { setCookies, readCookies } from '../lib/cookies.js'
import { setHeaders } from '../lib/server.js'
import { getUserByEmail } from '../lib/db.js'
import { hashEqual, encodeJWT, hashString } from '../lib/auth.js'
import { loginEmailError, loginPasswordError, paramsError } from '../util/errors.js'

const baseUrl = process.env.BASE_URL

export default async function(req, res, options = {}) {
  const { email, password } = await parseRequestJson(req)
  const user = await getUserByEmail(email)

  setHeaders(res, { contentType: 'text/json' })

  if (!email || !password) {
    res.write(paramsError())
  } else if (!user) {
    res.write(loginEmailError())
  } else if (!hashEqual(password, user.passw)) {
    res.write(loginPasswordError())
  } else {
    const token = encodeJWT({ id: user.user_id, rol: 'user' })
    setCookies(res, { token }, { maxAge: 3600 * 24 * 30 }) // 30 days
    res.write(JSON.stringify({
      success: true,
      redirect: baseUrl,
    }))
  }
  
  res.statusCode = 200
  res.end()
}