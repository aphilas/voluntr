import { writeResData } from '../lib/server.js'
import { getAll, getById, getJobsByStatus, getJobsByOrg } from '../lib/db.js'
import { getApplicationsByJob, getApplicationsByUserJob, getApplicationsByUser, getApplication } from '../lib/db.js'
import { getSavedJobs } from '../lib/db.js'
import { decodeJWT } from '../lib/auth.js'
import { readCookies } from '../lib/cookies.js'
import { authError } from '../util/errors.js'

/** jobs */

const getJobs = async (req, res, { status, id } = {}, type) => {

  const { token } = readCookies(req)
  let userId
  let data

  // get token details
  const decodeToken = token ? decodeJWT(token, true) : undefined

  if (token && decodeToken) {
    userId = decodeToken.id
  } else {
    writeResData(res, JSON.parse(authError()))
    return
  }

  switch (type) {
    case 'status':
      data = await getJobsByStatus[status](userId)
      break
    case 'all':
      data = await getAll.jobs()
      break
    case 'org':
      data = await getJobsByOrg(id)
      break
    case 'id':
      data = await getById.job(id) 
      break
    default:
      break
  }

  writeResData(res, { success: true, data })
}

/** applications */

const getApls = async (req, res, { id, userId, jobId } = {}, type) => {
  let dbRes

  switch (type) {
    case 'id':
      dbRes = await getApplication(id)
      break
    case 'user':
      dbRes = await getApplicationsByUser(id)
      break
    case 'user-job':
      dbRes = await getApplicationsByUserJob(userId, jobId)
      break
    case 'job':
      dbRes = await getApplicationsByJob(id)
      break
    default:
      break
  }

  writeResData(res, { success: true, data: dbRes })
}

/** saved jobs */

const getSaved = async (req, res, { id }  = {}, type) => {
  let data

  switch (type) {
    case 'user':
      data = await getSavedJobs(id)
      break
    default:
      break
  }

  writeResData(res, data)
}

/** get user */

const getUser = async ( req, res, { id } = {}) => {
  const user = await getById.user(id)
  const response = { success: true, ...user }

  writeResData(res, response)
}

export { getSaved, getApls, getJobs, getUser }
