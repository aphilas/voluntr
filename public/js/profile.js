import { sel, Error, disableFormInputs, appendError } from './dom.js'
import { queryServer, parseCookies, parseJwt } from './utils.js'

const form = sel('.profile > form')
disableFormInputs(form)

const updateForm = (user) => {
  const inputs = form.elements
  for (const input of inputs) {
    input.value = user[input.name]
  }
}

const init = (async () => {
  const { token } = parseCookies(document.cookie)

  if (!token) {
    sel('.profile').innerHTML = ''
    appendError({ error: 'Authentication Error' })
    return
  }

  const { id: userId } = parseJwt(token)
  const res = await queryServer('GET', `/api/user/${ userId }`)
  const { success, error, message } = res

  if (success === false) {
    appendError({ error, message })
    return
  }

  const { fname, lname, skills, email } = res

  updateForm({ fname, lname, skills, email })
})()
