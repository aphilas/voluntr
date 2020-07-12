import { baseUrl } from '../js/config.js'
import { formDataObj } from './utils.js'

const loginForm = document.querySelector('.form.login')

const loginRequest = async (formData) => {
  const url = baseUrl + '/login'
  const headers = new Headers({ 'Content-Type': 'text/json' })
  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(formDataObj(formData)),
  }

  const response = await fetch(url, options)
  const { success, redirect = baseUrl + '/login.html', error, message } = await response.json()
  // console.log({ success, redirect, error, message })

  if (success === false) {
    document.getElementsByTagName('main')[0].appendChild((_ => {
      const errorEl = document.createElement('div')
      errorEl.classList.add('error')
      errorEl.innerHTML = `<p>${ message }</p>`
      return errorEl
    })())
  }

  if (success) {
    window.location.assign(redirect)
  }
}

loginForm.addEventListener('submit', event => {
  event.preventDefault()
  const formData = new FormData(event.target)
  // formData.append('redirect', baseUrl + '/index.html')
  loginRequest(formData)
})