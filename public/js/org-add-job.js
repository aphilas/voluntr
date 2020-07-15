import { baseUrl } from '../js/config.js'
import { formDataObj, parseCookies, parseJwt } from './utils.js'
import { Error, sel, h, appendError } from './dom.js'

const addJobForm = document.querySelector('.add-job-form')

const getDate = (addMonths = 0) => {
  const date = new Date()
  return `${date.getFullYear()}-${date.getMonth() + 1 + addMonths}-${date.getDate()}`
}

const dateEl = sel('input[type=date]')
dateEl.setAttribute('min', getDate())
dateEl.setAttribute('value', getDate(1))

const addJobRequest = async (formData) => {
  const url = baseUrl + '/api/job'
  const headers = new Headers({ 'Content-Type': 'text/json' })
  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(formDataObj(formData)),
  }

  const response = await fetch(url, options)
  const { success, redirect = baseUrl + '/org-jobs.html', error, message } = await response.json()
  if (success) {
    window.location.assign(redirect)
  }

  if (error) {
    appendError({ error, message })
  }
}

addJobForm.addEventListener('submit', event => {
  event.preventDefault()
  const formData = new FormData(event.target)
  addJobRequest(formData)
})

const init = (_ => {
  const { token } = parseCookies(document.cookie)
  if (!token) {
    appendError({ error: 'Authentication Error' })
    return
  }
  
  const { id, rol: role } = parseJwt(token)
  sel('#org-id').value = id
})()
