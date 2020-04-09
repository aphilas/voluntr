import postData from '../lib/parse-body.js'
import { textResponse } from '../util/server/write-response.js'
import { getByEmail } from '../db/db.js'
import { createSID, storeSID, checkSID } from '../lib/session.js'
import { setCookies, readCookies } from '../lib/cookies.js'

export default async function(req, res, options = {}) {
  const { email, password } = await postData(req)
  const user = await getByEmail(email)
  
  if (user && user.password === password) {
    const sid = createSID()
    storeSID(sid)
    const cookies = { sid }
        
    if (options.redirect) {
    } else {
      setCookies(cookies, res)
      res.write(`Logged In successfully! Hello ${user.uname}`)
      res.end()
    }

  } else {
    console.log('Wrong email or password. Try again!')
  }
}