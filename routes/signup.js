import { parseRequestJson } from '../lib/parse-request.js'
import { insertUser, getUserByEmail } from '../db/db.js'
import { insertOrg, getOrgByEmail } from '../db/db.js'
import { readCookies, setCookies } from '../lib/cookies.js'
import { setHeaders } from '../lib/server.js'
import { hashString } from '../lib/auth.js'
import { paramsError, dbError, signupEmailError } from '../util/errors.js'
import { undef } from '../util/helpers.js'

const baseUrl = process.env.BASE_URL

export default async function(req, res) {
  
  const data = await parseRequestJson(req)
  const { role } = data
  setHeaders(res, { contentType: 'text/json' })

  if (role == 'org') {
    const  { orgName, about, email, password } = data
    if (undef(orgName, about, email, password)) {
      res.write(paramsError())
    } else {
      try {
        if (await getOrgByEmail(email)) {
          res.write(signupEmailError())
        } else {
          const hashedPassword = hashString(password)
          const dbRes = await insertOrg(orgName, about, email, hashedPassword)
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
  }

  if (role == 'user') {
    const  { fname, lname, skills, email, password } = data
  
    if (undef(fname, lname, skills, email, password)) {
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
  }

  res.statusCode = 200
  res.end()
}