import { objToCamel, parseJwt, parseCookies, queryServer, debounce } from './utils.js'
import { renderList, aplTemplate, h, sel, infiniteScrolling, Error } from './dom.js'

const init = (async () => {
  const { token } = parseCookies(document.cookie)
  const { id: userId } = parseJwt(token)

  const res = await queryServer('GET', `/api/apl/user/${userId}`)
  const { success, error, message, data } = res

  if (success === false) {
    let errorEL
    if (error == 'Authentication Error') {
      errorEl = h('Please ', h('a', { href: './login.html' }, 'Log In'), 'to continue')
    }

    const container = sel('main').appendChild(h('div'))
    const domError = Error(container).append(errorEl ? errorEL : message ) 
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



