import { deleteSID } from '../lib/session.js'
import getPost from '../lib/parse-body.js'
import { redirect } from '../util/server/redirect.js'

const postLogout =  async (req, res) => {
  const { sid } = await getPost(req)
  deleteSID(sid)
  redirect(res, 'http://localhost:8080/') // redirect to home
}


export { postLogout }