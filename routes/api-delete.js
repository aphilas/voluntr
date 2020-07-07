import { deleteJob } from '../lib/db.js'
import { writeResData } from '../lib/server.js'
import { deleteSavedJob } from '../lib/db.js'
import { parseRequestJson } from '../lib/parse-request.js'
 
async function delSaved (req, res) {
  const { userId, jobId } = await parseRequestJson(req)
  const dbRes = await deleteSavedJob(userId, jobId)
  writeResData(res, { success: dbRes  })
}
 
async function delJob(req, res, { id }) {
  try {
    if (await deleteJob(id)) {
      writeResData(res, { success: true })
    } else {
      writeResData(res, { success: false })
    }
  } catch (err) {
    writeResData(res, { success: false })
    console.error(err)
  }
}

export { delJob, delSaved }