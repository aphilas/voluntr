import { writeResData } from '../lib/server.js'
import { parseRequestJson } from '../lib/parse-request.js'
import { updateJob } from '../lib/db.js'
import { updateJobStatus } from '../lib/db.js'

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
        stringifyAndWrite(res, { success: true })
      } else {
        stringifyAndWrite(res, { success: false })
      }
    } catch (err) {
      stringifyAndWrite(res, { success: false })
      console.error(err)
    }
  }
}

export { putJob, patchJobStatus }