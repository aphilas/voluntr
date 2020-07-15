import { sel, Error, disableFormInputs, appendError } from './dom.js'
import { queryServer, parseCookies, parseJwt, objToCamel } from './utils.js'

const form = sel('.profile > form')
disableFormInputs(form)

const updateForm = (obj) => {
  const inputs = form.elements
  for (const input of inputs) {
    input.value = obj[input.name]
  }
}

const init = (async () => {
  const { token } = parseCookies(document.cookie)

  if (!token) {
    sel('.profile').innerHTML = ''
    appendError({ error: 'Authentication Error' })
    return
  }

  const { id, rol: role } = parseJwt(token)
  const res = await queryServer('GET', `/api/${role}/${id}`)
  const { success, error, message } = res

  if (success === false) {
    appendError({ error, message })
    return
  }

  const data = objToCamel(res.data)

  // const { fname, lname, skills, email } = data
  // const { orgName, about, email } = data

  updateForm(data)
})()
