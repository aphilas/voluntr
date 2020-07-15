import { writeResData } from '../lib/server.js'
import { parseRequestJson } from '../lib/parse-request.js'
import { updateJob } from '../db/db.js'
import { updateJobStatus, updateAplStatus } from '../db/db.js'
import { paramsError } from '../util/errors.js'

async function putJob(req, res, { id } = {}) {
  const {  jobName, orgId, skills, jobDesc, jobStatus, expiry, } = await parseRequestJson(req)

  try {
    if (await updateJob(id, [ jobName, orgId, skills, jobDesc, jobStatus, expiry ])) {
      writeResData(res, { success: true })
    } else {
      writeResData(res, { success: false })
    }
  } catch (err) {
    writeResData(res, { success: false })
    console.error(err)
  }
}

function patchJobStatus ( type ) {
  return async function routeUpdateJobDeactivate(req, res, { id } = {}) {
    try {
      // updateJobStatus.delete(id)
      // console.log({ method: type })
      if (await updateJobStatus[type](id)) {
        writeResData(res, { success: true })
      } else {
        writeResData(res, { success: false })
      }
    } catch (err) {
      writeResData(res, { success: false })
      console.error(err)
    }
  }
}

function patchAplStatus ( type ) {
  return async function (req, res, { id } = {}) {

    if (!parseInt(id)) {
      writeResData(res, JSON.parse(paramsError()))
      return
    }

    try {
      if (await updateAplStatus[type](id)) {
        writeResData(res, { success: true })
      } else {
        writeResData(res, { success: false })
      }
    } catch (err) {
      writeResData(res, { success: false })
      console.error(err)
    }
  }
}

export { putJob, patchJobStatus, patchAplStatus }