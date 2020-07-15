import { serveHtml } from '../lib/server.js'
import { Router } from '../lib/router.js'
import postLogin from './login.js'
import postSignup from './signup.js'

import { getSaved, getApls, getJobs, getUser, getOrg } from './api-get.js'
import { delJob, delSaved } from './api-delete.js'
import { postApl, postJob, postSaved } from './api-post.js'
import { putJob, patchJobStatus, patchAplStatus } from './api-update.js'

const router = Router()

router.addMultiple('get', new Map([
  ['/', (req, res) => serveHtml('public/index.html', res)],
  ['/api/org/:id', getOrg ],
  ['/api/user/:id', getUser ],
  ['/api/saved-jobs/:id', (req, res, params) => getSaved(req, res, params, 'user') ],
  ['/api/apl/:id', (req, res, params) => getApls(req, res, params, 'id') ],
  ['/api/apl/job/:id', (req, res, params) => getApls(req, res, params, 'job') ],
  ['/api/apl/user/:userId/job/:jobId', (req, res, params) => getApls(req, res, params, 'user-job') ],
  ['/api/apl/user/:id', (req, res, params) => getApls(req, res, params, 'user') ],
  ['/api/jobs/', (req, res, params) => getJobs(req, res, params, 'all') ],
  ['/api/jobs/:id', (req, res, params) => getJobs(req, res, params, 'id') ],
  ['/api/jobs/org/:id', (req, res, params) => getJobs(req, res, params, 'org') ],
  ['/api/jobs/status/:status', (req, res, params) => getJobs(req, res, params, 'status')],
]))

router.addMultiple('post', new Map([
  ['/api/job', postJob],
  ['/api/saved-job', postSaved],
  ['/api/apl', postApl],

  ['/login', postLogin],  
  ['/signup', postSignup],
]))

router.addMultiple('delete', new Map([
  ['/api/job/:id', delJob],
  ['/api/saved-job', delSaved]
]))

router.addMultiple('patch', new Map([
  ['/api/job/:id/activate', patchJobStatus('activate')],
  ['/api/job/:id/deactivate', patchJobStatus('deactivate')],
  ['/api/job/:id/delete', patchJobStatus('delete')],

  ['/api/apl/:id/approve', patchAplStatus('approve')],
  ['/api/apl/:id/pending', patchAplStatus('pending')],
  ['/api/apl/:id/reject', patchAplStatus('reject')],
  ['/api/apl/:id/deactivate', patchAplStatus('deactivate')],
]))

router.addMultiple('put', new Map([
  ['/api/job/:id', putJob],
]))


/**
 * 
 
  const { token } = readCookies(req)
  setHeaders(res, { contentType: 'text/plain' })

  const decodeToken = token ? decodeJWT(token) : undefined

  if (token && decodeToken) {
    res.write(`Dashboard: ${ decodeToken.username }`)
  } else if (token && !decodeToken) {
    res.write('Token tampered with')
  } else {
    res.write('Please login')
  }

  res.end()
  
 */

export { router }