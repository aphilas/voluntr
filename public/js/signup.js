
import { encodeFormData } from '../js/utils/request.js'

const signupForm = document.querySelector('.signup-form')

const signupRequest = async (formData) => {
  const url = 'http://localhost:8080/signup'
  const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' })
  const options = {
    method: 'POST',
    headers,
    body: encodeFormData(formData),
  }

  const response = await fetch(url, options)
  const { success, redirect = undefined } = await response.json()

  if (success) window.location.href = redirect
}

signupForm.addEventListener('submit', event => {
  event.preventDefault()
  const formData = new FormData(event.target)
  signupRequest(formData)
})