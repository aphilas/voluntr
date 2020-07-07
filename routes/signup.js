import { parseRequestJson } from '../lib/parse-request.js'
import { insertUser, getUserByEmail } from '../lib/db.js'
import { baseUrl } from '../index.js'

import { readCookies, setCookies } from '../lib/cookies.js'
import { setHeaders } from '../lib/server.js'
import { hashString } from '../lib/auth.js'
import { paramsError, dbError, signupEmailError } from '../util/errors.js'


export default async function(req, res) {
  const { fname, lname, skills, email, password } = await parseRequestJson(req)

  setHeaders(res, { contentType: 'text/json' })

  if (!fname || !lname || !skills || !email || !password) {
    res.write(paramsError())
  } else {
    try {
      if (await getUserByEmail(email)) {
        res.write(signupEmailError())
      } else {
        
        const hashedPassword = hashString(password)
        const dbRes = await insertUser(fname, lname, skills, email, hashedPassword)
        if (dbRes) {
          const result = { success: true , redirect: baseUrl + '/login.html' }
          res.write(JSON.stringify(result))
        } else {
          res.write(dbError())
        }
      }
    } catch (err) {
      console.error(err)
      res.write(dbError())
    }
  }

  res.statusCode = 200
  res.end()
}