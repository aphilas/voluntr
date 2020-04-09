import postData from '../lib/parse-body.js'
import { textResponse } from '../util/server/write-response.js'
import { insert } from '../db/db.js'
import { redirect } from '../util/server/redirect.js'

export default async function(req, res) {
  const { username, email, password } = await postData(req)
  
  try {
    const dbRes = await insert(username, email, password)
    if (dbRes.changes === 1) {
      console.log('Signed Up successfully')

      const result = { success: true , redirect: 'http://localhost:8080/login' }
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.write(JSON.stringify(result))
      res.end()
      
    } else {
      console.log('Sorry ... try signing up again')
      
      const result = { successfully: false }
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.write(JSON.stringify(result))
      res.end()
    }
  } catch (err) {
    console.error(err)
    textResponse(res, 'Signup')
  }
}