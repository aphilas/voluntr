import { writeResData } from '../lib/server.js'
import { parseRequestJson } from '../lib/parse-request.js'
import { insertApplication } from '../db/db.js'
import { insertSavedJob } from '../db/db.js'
import { insertJob } from '../db/db.js'
import { paramsError } from '../util/errors.js'

async function postApl(req, res) {
  const { userId, jobId, appDesc } = await parseRequestJson(req)

  if (!userId || !jobId || !appDesc) {
    writeResData(res, JSON.parse(paramsError()))
    return
  }

  try {
    if (await insertApplication(...Object.values(req.body))) {
      writeResData(res, { success: true })
    } else {
      writeResData(res, { success: false })
    }
  } catch (err) {
    writeResData(res, { success: false })
    console.error(err)
  }
}

async function postSaved(req, res) {
  const { userId, jobId } = await parseRequestJson(req)

  if (!userId || !jobId) {
    stringifyAndWrite(res, { success: false, message: 'properties userId and/or jobId not found' })
  }

  try {
    if (await insertSavedJob(...Object.values(req.body))) {
      writeResData(res, { success: true })
    } else {
      writeResData(res, { success: false })
    }
  } catch (err) {
    writeResData(res, { success: false })
    console.error(err)
  }
}

const oneMonthFromNow = _ => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return date
}

async function postJob(req, res) {
  const { 
    jobName, 
    orgId, 
    skills, 
    jobDesc, 
    expiry = oneMonthFromNow().toISOString(), 
    lat = -1.292066, 
    lon = 36.821945, 
  } = await postData(req)

  if ([jobName, orgId, skills, jobDesc].some(prop => !prop)) {
    stringifyAndWrite(res, { success: false, message: 'missing values' })
    return
  }

  try {
    if (await insertJob(...Object.values(req.body))) {
      stringifyAndWrite(res, { success: true })
    } else {
      stringifyAndWrite(res, { success: false })
    }
  } catch (err) {
    stringifyAndWrite(res, { success: false })
    console.error(err)
  }
}

export { postApl, postJob, postSaved }