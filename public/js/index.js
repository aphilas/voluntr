import { objToCamel, parseJwt, parseCookies, queryServer, debounce } from './utils.js'
import { renderList, jobTemplateFn, h, sel, infiniteScrolling, Error } from './dom.js'

const ulEl = sel('.jobs > ul')
const liEl = h('li', { class: 'job' })

const renderJobs = jobs => renderList(jobs, ulEl, liEl, (el, job) => {
  el.dataset.jobId = job.jobId
  el.innerHTML = jobTemplateFn(job)
  sel('.save', el).addEventListener('click', debounce(saveJob, 50))
})

/**
 * Save job handler
 * @param {Event} event 
 */
async function saveJob (event) {
  event.stopPropagation()
  const currentTarget = event.currentTarget || this

  const svgEl = sel('svg', currentTarget)
  
  const jobId = parseInt(currentTarget.dataset.jobId)
  const { token } = parseCookies(document.cookie)
  const { id: userId } = parseJwt(token)
  const payload = { userId, jobId }

  const active = svgEl.classList.contains('active')
  const { success } = await queryServer(active ? 'DELETE' : 'POST', '/api/saved-job', payload) || {}
  if (success === true) svgEl.classList.toggle('active')
}

const init = (async () => {
  const res = await queryServer('GET', '/api/jobs/status/running')
  const { success, error, message } = res

  if (success === false) {
    let errorEL
    if (error == 'Authentication Error') {
      errorEl = h('Please ', h('a', { href: './login.html' }, 'Log In'), 'to continue')
    }

    const container = sel('main').appendChild(h('div'))
    const domError = Error(container).append(errorEl ? errorEL : message ) 
    return
  }

  const jobs = res.map(job => objToCamel(job))
  infiniteScrolling(jobs, 20, 5, renderJobs)
})()