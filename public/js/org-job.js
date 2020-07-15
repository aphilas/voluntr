import { objToCamel, camelToSnake, parseJwt, parseCookies, queryServer } from './utils.js'
import { h, sel, Error, parseDate, disableFormInputs } from './dom.js'

const applyForm = sel('.apply')

const labels = {
  running: 'safe',
  deleted: 'danger',
  inactive: 'danger',
}

const renderJob = job => {
  const keys = [ 'jobName', 'jobStatus', 'skills', 'posted', 'expiry', 'jobDesc' ]

  const labelEl = sel('.label')
  labelEl.classList.remove('danger')
  labelEl.classList.add(labels[job.jobStatus])

  for (const key of keys) {
    let value = job[key]

    if (key == 'posted' || key == 'expiry') value = `${key} - ${parseDate(value)}`
    if (key == 'skills') value = `#${value}`

    sel(`.${camelToSnake(key)}`).innerText = value
  }
}

const init = (async () => {
  const pageUrl = new URL(document.location)
  const jobId = parseInt(pageUrl.searchParams.get('job-id'))

  if (!jobId) {
    const main = sel('main')
    main.innerHTML = ''
    const container = main.appendChild(h('div'))
    Error(container).clear().append(`There was an error opening the job`) 
    return
  }

  sel('.apl-link > a').setAttribute('href', `./org-applications.html?job-id=${jobId}`)

  const { token } = parseCookies(document.cookie)
  const { id: userId } = parseJwt(token)

  const res = await queryServer('GET', `/api/jobs/${jobId}`)
  const { success, error, message, data } = res

  if (success === false) {
    const container = sel('main').appendChild(h('div'))
    Error(container).append(`${error} - ${message}`) 
    return
  }

  if (success === true) {
    const job = objToCamel(data)
    renderJob(job)
  }
})()
