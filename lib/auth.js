import { createHash, createHmac } from 'crypto' 
// import { secretKey } from '../index.js'

const secretKey = 'secret-key'

const hashString = (password, { salt = secretKey } = {}) => {
  return createHash('md5').update(password + salt ).digest('hex')
}

const hashEqual = (rawString, hash) => {
  if (hashString(rawString) == hash) return true
}

/** JWT */

const encodeBase64 = str => Buffer.from(str).toString('base64').toString("utf-8")
const decodeBase64 = str => Buffer.from(str, 'base64').toString("utf-8")
const stringify = obj => JSON.stringify(obj)
const headerData = {alg: 'HS256', typ: 'JWT'}

const generateSignature = (header, body) => {
  const payload = `${header}.${body}`
  const checkSum = createHmac('sha256', secretKey)
    .update(payload).digest('base64').toString('utf8')
  return checkSum
}

const encodeJWT = data => {
  const header = encodeBase64(stringify(headerData))
  const body = encodeBase64(stringify(data))
  const signature = generateSignature(header, body)
  return `${header}.${body}.${signature}`
}

const decodeJWT = (jwt, decodeURI = false) => {
  const str = decodeURI ? decodeURIComponent(jwt) : jwt
  const [header, body, signature] = str.split('.')
  const checkSum = generateSignature(header, body)

  if(signature === checkSum) {
    return JSON.parse(decodeBase64(body))
  } else {
    return false
  }
}

export { decodeJWT, encodeJWT, hashEqual, hashString }