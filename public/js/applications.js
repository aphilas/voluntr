import { objToCamel, parseJwt, parseCookies, queryServer, debounce } from './utils.js'
import { renderList, aplTemplate, h, sel, appendError } from './dom.js'

const init = (async () => {
  const { token } = parseCookies(document.cookie)
  if (!token) {
    appendError({ error: 'Authentication Error' })
    return
  }

  const { id: userId } = parseJwt(token)

  const res = await queryServer('GET', `/api/apl/user/${userId}`)
  const { success, error, message, data } = res

  if (success === false) {
    appendError({ error, message })
    return
  }

  if (success === true) {
    const apls = data.map(apl => objToCamel(apl))
    const ulEl = sel('.applications > ul')

    if (apls.length == 0) ulEl.appendChild(h('li', {},  'Submit a job application, by clicking on a job, to see it here.'))

    renderList(apls, ulEl, h('li', { class: 'application card' }), (el, item) => { 
      el.innerHTML = aplTemplate(item)
    })
  }
})()



