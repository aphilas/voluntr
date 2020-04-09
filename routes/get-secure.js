import { readCookies } from '../lib/cookies.js'
import { checkSID } from '../lib/session.js'
import { textResponse } from '../util/server/write-response.js'

const getSecure = (req, res) => {
  const { sid } = readCookies(req)

  if (checkSID(sid)) {
    textResponse(res, `You're in!`)
  } else {
    res.writeHead(302, {
      'Location': 'http://localhost:8080/login'
    })
    res.end()  
  }
}

export { getSecure }