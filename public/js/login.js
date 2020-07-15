import { baseUrl } from '../js/config.js'
import { formDataObj } from './utils.js'


const loginForm = document.querySelector('.form.login')
const redirectUrl = decodeURI(new URL(document.location.href).searchParams.get('redirect') || '')

const loginRequest = async (formData) => {
  const url = baseUrl + '/login'
  const headers = new Headers({ 'Content-Type': 'text/json' })
  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(formDataObj(formData)),
  }

  const response = await fetch(url, options)
  const { success, redirect = baseUrl + '/index.html', error, message } = await response.json()

  if (success === false) {
    document.getElementsByTagName('main')[0].appendChild((_ => {
      const errorEl = document.createElement('div')
      errorEl.classList.add('error')
      errorEl.innerHTML = `<p>${ message }</p>`
      return errorEl
    })())
  }

  if (success === true) window.location.assign(redirectUrl || baseUrl)
}

loginForm.addEventListener('submit', event => {
  event.preventDefault()
  const formData = new FormData(event.target)
  // formData.append('redirect', baseUrl + '/index.html')
  loginRequest(formData)
})