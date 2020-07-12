import { sel, Error, disableFormInputs } from './dom.js'
import { queryServer, parseCookies, parseJwt } from './utils.js'

const form = sel('.profile > form')
disableFormInputs(form)

const updateForm = (user) => {
  for (const input of inputs) {
    input.value = user[input.name]
  }
}

const init = (async () => {
  const { token } = parseCookies(document.cookie)
  const { id: userId } = parseJwt(token)
  const res = await queryServer('GET', `/api/user/${ userId }`)
  const { success, error, message } = res

  if (success === false) {
    const container = sel('main').appendChild(h('div'))
    Error(container).append(message) 
    return
  }

  const { fname, lname, skills, email } = res

  updateForm({ fname, lname, skills, email })
})()
