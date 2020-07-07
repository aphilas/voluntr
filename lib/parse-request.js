import { parse } from 'querystring'
import Deffered from '../util/deffered.js'

/**
 * Parse post data from a request
 * @param {Request} req http request object
 * @returns {Promise} promise that resolves to post data
 */
const parseRequest = req => {
  const chunks = []

  const postDeffered = new Deffered()

  req.on('data', chunk => {
    chunks.push(chunk)
  })

  req.on('end', () => {
    try {
      const data = Buffer.concat(chunks).toString()
      const postData = parse(data)
      postDeffered.resolve(postData)
    } catch (err) {
      postDeffered.reject(err)
    }
  })
  
  return postDeffered.promise
}

/**
 * Parse json post data from a request
 * @param {Request} req http request object
 * @returns {Promise} promise that resolves to post data
 */
const parseRequestJson = req => {
  let data = ''

  const postDeffered = new Deffered()

  req.on('data', chunk => {
    data += chunk
  })

  req.on('end', _ => {
    try {
      const parsed = JSON.parse(data)
      postDeffered.resolve(parsed)
      req.body = parsed
    } catch (err) {
      console.error(err)
    }

    postDeffered.resolve(data)
  })
  
  return postDeffered.promise
}

export { parseRequest, parseRequestJson }