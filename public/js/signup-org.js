import { baseUrl } from '../js/config.js'
import { formDataObj } from './utils.js'
import { Error, sel, h } from './dom.js'

const signupForm = document.querySelector('.signup-form')

const signupRequest = async (formData) => {
  const url = baseUrl + '/signup'
  const headers = new Headers({ 'Content-Type': 'text/json' })
  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(formDataObj(formData)),
  }

  const response = await fetch(url, options)
  const { success, redirect = baseUrl + '/login.html', error, message } = await response.json()
  if (success) {
    window.location.assign(redirect)
  }

  if (error && error === 'Signup Email Error' ) {
    const container = sel('main').appendChild(h('div'))
    const el = h('p', {}, `${message}. Try `,
      h('a', { href: './login.html' }, 'Logging In.' ))
    Error(container).append(el) 
  }
}

signupForm.addEventListener('submit', event => {
  event.preventDefault()
  const formData = new FormData(event.target)
  signupRequest(formData)
})