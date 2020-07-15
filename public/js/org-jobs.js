import { objToCamel, parseJwt, parseCookies, queryServer } from './utils.js'
import { renderList, jobTemplateOrg, h, sel, appendError } from './dom.js'
import { baseUrl } from './config.js'

const ulEl = sel('.jobs > ul')
const liEl = h('li', { class: 'job' })

const renderJobs = jobs => renderList(jobs, ulEl, liEl, (el, job) => {
  el.dataset.jobId = job.jobId
  el.innerHTML = jobTemplateOrg(job)
},
[{
  event: 'click',
  listener(event) {
    // event.stopPropagation()
    const tag = event.target.tagName
    const currentTarget = event.currentTarget || this
    const jobId = currentTarget.dataset.jobId
    document.location.assign(baseUrl + `/org-job.html?job-id=${jobId}`)
  }
}])

const init = (async () => {
  const { token } = parseCookies(document.cookie)
  if (!token) {
    appendError({ error: 'Authentication Error' })
    return
  }

  const { id, rol: role } = parseJwt(token)
    const res = await queryServer('GET', `/api/jobs/org/${id}`)
    const { success, error, message, data } = res

    if (success === false) {
      appendError({ error, message })
      return
    }

    const jobs = data.map(job => objToCamel(job))

    if (jobs.length == 0) ulEl.appendChild(h('li', {}, 'Add a job to see it here'))
    renderJobs(jobs)
})()