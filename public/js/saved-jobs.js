import { objToCamel, parseJwt, parseCookies, queryServer, debounce } from './utils.js'
import { renderList, jobTemplateFn, h, sel, infiniteScrolling, Error } from './dom.js'

const ulEl = sel('.jobs > ul')
const liEl = h('li', { class: 'job' })

const state = { }

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
  const payload = { userId: state.userId, jobId }

  const active = svgEl.classList.contains('active')
  const { success } = await queryServer(active ? 'DELETE' : 'POST', '/api/saved-job', payload) || {}
  if (success === true) svgEl.classList.toggle('active')
}

const init = (async () => {
  const { token } = parseCookies(document.cookie)
  const { id: userId } = parseJwt(token)
  state.userId = userId

  const res = await queryServer('GET', `/api/saved-jobs/${ state.userId }`)
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

  const jobs = res.map(job => objToCamel(job)).map(job => { 
    job.saved = true
    return job
  })
  infiniteScrolling(jobs, 20, 5, renderJobs)
})()