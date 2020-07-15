import { parseRequestJson } from '../lib/parse-request.js'
import { setCookies, readCookies } from '../lib/cookies.js'
import { setHeaders, redirect } from '../lib/server.js'
import { getUserByEmail, getOrgByEmail } from '../db/db.js'
import { hashEqual, encodeJWT } from '../lib/auth.js'
import { loginEmailError, loginPasswordError, paramsError } from '../util/errors.js'
import { loadEnv } from '../env.js'

loadEnv()
const baseUrl = process.env.BASE_URL

export default async function(req, res, options = {}) {
  const { email, password } = await parseRequestJson(req)

  setHeaders(res, { contentType: 'text/json' })

  if (!email || !password) {
    res.write(paramsError())
    res.statusCode = 200
    res.end()
    return
  }

  const user = await getUserByEmail(email)
  const org = await getOrgByEmail(email)

  const role = user ? 'user'
    : org ? 'org'
    : undefined // clean this up

  if (!role) { 
    res.write(loginEmailError())
  } else {
    if (!hashEqual(password, user?.passw || org?.passw )) {
      res.write(loginPasswordError())
    } else {
      const token = encodeJWT({ id: user?.user_id || org?.org_id, rol: role })
      setCookies(res, { token }, { maxAge: 3600 * 24 * 30 }) // 30 days
      res.write(JSON.stringify({
        success: true,
        redirect: baseUrl,
      }))
    }
  }
  
  res.statusCode = 200
  res.end()
}