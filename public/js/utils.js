import { baseUrl } from './config.js'

const formDataObj = formData => {
  const data = {}
  for (let [key, value] of formData) {
    data[key] = value
  }
  return data
}

/**
 * 
 * @param {function} fn 
 * @param {number} delay 
 */
const debounce = (fn, delay) => {
  let timeout

  return function(...args) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(_ => {
      fn.apply(context, args)
    }, delay)
  }
}

const throttle = (fn, limit) => {
  let inThrottle

  return function(...args) {
    const context = this
    if (!inThrottle) {
      fn.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

const parseJwt = (str) => {
  try {
    return JSON.parse(atob(str.split('.')[1]))
  } catch (err) {
    console.error(err)
    return null
  }
}

const parseCookies = cookie => {
  if (!cookie) return {}

  const regex = /([^;=\s]*)=([^;]*)/g
  const cookieObj = {}

  for (let m; m = regex.exec(cookie);) {
    cookieObj[m[1]] = decodeURIComponent(m[2])
  }

  return cookieObj
}

const snakeToCamel = str => str.replace(/(\_\w)/g, k => k[1].toUpperCase())

const StepWise = arr => {
  let index = 0

  return {
    next(items) {
      const chunk = arr.slice(index, index + items)
      index += items
      if (chunk.length == 0) return
      return chunk
    }
  } 
}

const objToCamel = obj => {
  const res = {}

  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      res[snakeToCamel(prop)] = obj[prop]
    }
  }

  return res
}

/**
 * 
 * @param {string} method HTTP method
 * @param {string} url Url (appended to base url)
 * @param {} payload Request data
 */
const queryServer = async (method, url, payload) => {
  const reqUrl = baseUrl + url
  let headers
  let body
  const options = { method }

  if (method !== 'GET') {
    headers = new Headers({ 'Content-Type': 'text/json' })
    options.headers = headers
  }

  if (payload) {
    body = JSON.stringify(payload)
    options.body = body
  }

  try {
    const response = await fetch(reqUrl, options)
    const data = await response.json()
    return data
  } catch (err) {
    console.error(err)
  }
}

export { formDataObj, debounce, throttle, objToCamel, snakeToCamel, parseJwt, parseCookies, StepWise, queryServer }