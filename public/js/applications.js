import { objToCamel, parseJwt, parseCookies, queryServer } from './utils.js'
import { renderList, aplTemplate, h, sel, appendError, aplTemplateOrg, aplLabels, jobLabels } from './dom.js'

const init = (async () => {
  const { token } = parseCookies(document.cookie)
  if (!token) {
    appendError({ error: 'Authentication Error' })
    return
  }

  const { id, rol: role } = parseJwt(token)

  const pageUrl = new URL(document.location)
  const jobId = parseInt(pageUrl.searchParams.get('job-id'))

  if (!jobId && role == 'org') {
    appendError({ message: 'There was a problem getting applications' })
    return
  }

  let url = role == 'user' 
    ? `/api/apl/user/${id}`
    : `/api/apl/job/${jobId}`

  const res = await queryServer('GET', url)

  const { success, error, message, data } = res

  if (success === false) {
    appendError({ error, message })
    return
  }

  if (success === true) {
    const apls = data.map(apl => objToCamel(apl))
    const ulEl = sel('.applications > ul')

    if (apls.length == 0 && role == 'user') ulEl.appendChild(h('li', {},  'Submit a job application, by clicking on a job, to see it here.'))
    if (apls.length == 0 && role == 'org') ulEl.appendChild(h('li', {},  'No applications have been submitted yet'))

    renderList(apls, ulEl, h('li', { class: 'application card' }), (el, item) => {
      el.dataset.aplId = item.appId 
      el.dataset.status = item.appStatus 
      el.innerHTML = role == 'user' ? aplTemplate(item) : aplTemplateOrg(item)
    })
  }

  const handleBtn = async ({ target }) => {
    target.setAttribute('disabled', 'disabled')
    const liEl = target.closest('.application')
    const aplLabel = sel('.app-status', liEl)
    aplLabel.style.opacity = 0.4

    let type
    if (target.classList.contains('approve')) type = 'approve'
    if (target.classList.contains('reject')) type = 'reject'

    const status = {
      approve: 'approved',
      reject: 'rejected'
    }

    if (`${type}d` == aplLabel.innerText.toLowerCase()) {
      target.removeAttribute('disabled')
      aplLabel.style.opacity = 1
      return
    }

    const res = await queryServer('PATCH', `/api/apl/${liEl.dataset.aplId}/${type}`)
    const { success, error, message, data } = res
  
    if (success === false) {
      appendError({ error, message })
      return
    }
  
    if (success === true ) {
      aplLabel.setAttribute('class', `label app-status ${aplLabels[status[type]]}`) // FIX
      aplLabel.innerText = status[type]
    }

    aplLabel.style.opacity = 1
    target.removeAttribute('disabled')
  }

  const approveBtn = sel('.approve') || {}
  const rejectBtn = sel('.reject') || {}

  ;[...document.getElementsByClassName('approve'), ...document.getElementsByClassName('reject')]
    .forEach(btn => btn.addEventListener('click', handleBtn))
})()






