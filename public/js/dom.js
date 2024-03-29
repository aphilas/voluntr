import { throttle, StepWise } from './utils.js'

const aplLabels = {
  pending: 'warn',
  approved: 'safe',
  rejected: 'danger',
  inactive: 'danger',
}

const jobLabels = {
  running: 'safe',
  deleted: 'danger',
  inactive: 'danger',
}

/**
 * JSX-like helper to create elements
 * @param {string} tag Element tag name
 * @param {object} attrs 
 * @param {...any} children 
 * @author foxbunny 
 */
const h = (tag, attrs, ...children) => {
  const el = document.createElement(tag)
  for (let key in attrs) {
    if (key.slice(0, 2) == 'on') {
      const evtName = key.slice(2)
      const cb = attrs[key]
      if (cb == null) continue  // we can use null or undefnied to suppress
      el.addEventListener(evtName, cb)
    } else if (['disabled', 'autocomplete', 'selected', 'checked'].indexOf(key) > -1) {
      if (attrs[key]) {
        el.setAttribute(key, key)
      }
    } else {
      if (attrs[key] == null) continue  // Don't set undefined or null attributes
      el.setAttribute(key, attrs[key])
    }
  }

  if (children.length === 0) {
    return el
  }
  
  children.forEach(child => {
    if (child instanceof Node) {
      el.appendChild(child)
    } else {
      el.appendChild(document.createTextNode(child))
    }
  })

  return el
}

/**
 * querySelector() wrapper
 * @param {string} selector 
 * @param {Node} [root] 
 * @returns {Node}
 */
const sel = (selector, root = document) => root.querySelector(selector)

/**
 * Callback used by renderList.
 * @callback renderCallback
 * @param {Node} el
 * @param {item} item
 */


/**
 * 
 * @typedef {Object} ListEventListener  
 * @property {string} event
 * @property {function} caller
 *
 */

/**
 * Render a number of jobs into the UI
 * @param {object[]} list List of data to render
 * @param {Node} parentEl
 * @param {Node} rootEl
 * @param {renderCallback} fn Function to call for each item, called with params el, item
 * @param {ListEventListener[]} [rootEventListeners] Event listeners to add to root
 * @returns {void}
 */
const renderList = (list, parentEl, rootEl, fn, rootEventListeners = []) => {
  if (typeof rootEl === 'string') rootEl = document.createElement(rootEl)

  const docFrag = document.createDocumentFragment()
  
  for (const item of list) {
    const el = rootEl.cloneNode()
    rootEventListeners.forEach(({ event, listener }) => el.addEventListener(event, listener))
    fn(el, item)
    docFrag.appendChild(el)
  }

  if (typeof parentEl === 'string') parentEl = document.createElement(parentEl)
  parentEl.appendChild(docFrag)

  return parentEl
}

const parseDate = dateString => new Date(dateString).toLocaleDateString()

const jobTemplate = ({ jobId, jobName, orgName, skills, posted, expiry, saved }) => {

  return `
    <div class="title-skill">
      <h3 class="title">${ jobName }</h3>
      <p class="skill tag">#${ skills }</p>
    </div>

    <div class="org-save space-between">
      <p class="org bold">${ orgName }</p>
      <div class="save" title="Save job" data-job-id="${ jobId }">
        <svg class="heart ${ saved ? 'active' : '' }" viewBox="0 0 32 29.6">
        <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
        c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
        </svg> 
      </div>
    </div>

    <div class="job-meta">
      <p class="time posted"><span>POSTED - </span> <span>${ parseDate(posted) }</span> </p>
      <p class="time expires"><span>EXPIRES - </span> <span>${ parseDate(expiry) }</span> </p>
      <!-- <button class="t-btn primary apply" data-job-id="${ jobId }">Details</button> -->
    </div>
  `
}

const jobTemplateOrg = ({ jobId, jobName, orgName, skills, posted, expiry, saved }) => {
  return `
    <div class="title-skill">
      <h3 class="title">${ jobName }</h3>
      <p class="skill tag">#${ skills }</p>
    </div>

    <div class="job-meta">
      <p class="time posted"><span>POSTED - </span> <span>${ parseDate(posted) }</span> </p>
      <p class="time expires"><span>EXPIRES - </span> <span>${ parseDate(expiry) }</span> </p>
      <!-- <button class="t-btn primary apply" data-job-id="${ jobId }">Details</button> -->
    </div>
  `
}

const scrolledDown = (_ => {
  let prev
  return () => {
    let position = window.scrollY
    // if (position && (position > prev)) return true
    if (position && (position < prev)) return false
    prev = position
  }
})()

const infiniteScrolling = (data, initialSize, stepSize, renderFn) => {
  const dataStepWise = StepWise(data)

  const initial = dataStepWise.next(initialSize)
  if (initial) renderFn(initial)

  const loadMore = _ => {
    const nextData = dataStepWise.next(stepSize)
    if (nextData) renderFn(nextData)
  }

  const positionFromBottom = _ => document.documentElement.scrollHeight - (window.innerHeight + window.scrollY)

  window.addEventListener('scroll', throttle(_ => { 
    if (positionFromBottom() < 5 && scrolledDown() !== false) loadMore()
  }, 50))

  // window.addEventListener('resize', debounce(_ => {}, 200))
}

/**
 * Create DOM error messages
 * @param {Node} parent Node to append error to
 * @param {string} message
 * @param {boolean} html Is message in html?
 */
const Error = (parent) => {
  const createError = message => {
    const pEl = h('p')
    const regexMatch = /\<.*\>/.test(message)
    if (message instanceof Node) pEl.appendChild(message)
    if (typeof message === 'string' && regexMatch) pEl.innerHTML = message
    if (typeof message === 'string' && !regexMatch) pEl.textContent = message
    return h('div', { class: 'error' }, pEl)
  }

  return {
    append(message) {
      parent.appendChild(createError(message))
      return this
    },
    write(message) {
      this.clear()
      this.append(message)
      return this
    },
    clear() {
      parent.innerHTML = ''
      return this
    }
  }
}

const aplTemplate = ({ jobName, skills, orgName, submitted, appStatus }) => {
  const labels = {
    pending: 'warn',
    approved: 'safe',
    rejected: 'danger',
    inactive: 'danger',
  }

  return `
    <div class="row">
      <h3>${jobName}</h3>
      <div class="tag">#${skills}</div>
    </div>

    <div class="row">
      <p class="sub-title">${orgName}</p>
    </div>

    <div class="row">
      <p class="meta">submitted - <span>${parseDate(submitted)}</span></p>
      <div class="label ${labels[appStatus]}">${appStatus}</div>
    </div>
`
}

const aplTemplateOrg = ({ fname, lname, submitted, appStatus, appDesc, jobName, jobStatus, expiry, userSkills }) => {
  return `
    <div class="row">
      <h3>${fname} ${lname}</h3>
      <div class="tag">#${userSkills}</div>
    </div>

    <!-- <div class="row">
      <p class="sub-title">${jobName}</p>
      <p class="meta" style="align-self: center;">expiry - <span>${parseDate(expiry)}</span></p>
      <div class="label ${jobLabels[jobStatus]}">${jobStatus}</div>
    </div>  -->

    <div class="row desc">
      <p>${appDesc}</p>
    </div>

    <div class="row">
      <p class="meta">submitted - <span>${parseDate(submitted)}</span></p>
      <div class="label ${aplLabels[appStatus]} app-status">${appStatus}</div>
    </div>

    <div class="row buttons">
      <button class="t-btn primary approve">Approve</button>
      <button class="t-btn primary reject">Reject</button>
    </div>
`
}

const disableFormInputs = form => {
  const inputs = Array.from(form.elements)
  inputs.forEach(input => input.setAttribute('disabled', 'disabled'))
}

/**
 * Append an error element to the .main element
 * @param {object} error
 * @property {string} [error] 
 * @property {string} message
 * @returns {object} Error object
 * 
 */
const appendError = ({ error = 'Error', message = 'There was an error processing your request' } = {}) => {
  let el

  if (error == 'Authentication Error') {
    el = h( 'span', {}, 'Please ', 
      h('a', { href: `./login.html?redirect=${encodeURI(document.location.href)}` }, 'Log In'),
      ' to continue' )
  }

  const container = sel('.main').appendChild(h('div'))
  const errorObj = Error(container).append(el ? el : message ) 
  return errorObj
}

export { renderList, jobTemplate, jobTemplateOrg, aplTemplate, aplTemplateOrg, h, sel, scrolledDown, infiniteScrolling, Error, parseDate, disableFormInputs, appendError, aplLabels, jobLabels }