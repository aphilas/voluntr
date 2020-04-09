import { parse } from 'querystring'
import Deffered from '../util/deffered.js'

/**
 * Parse post data from a request
 * @param {Object} req http request object
 * @returns {Promise} promise that resolves to post data
 */
export default function(req) {
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