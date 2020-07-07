import { camelToKebab } from '../util/string-case.js'
import fs from 'fs'
import pathParser from 'path'
import urlParser from 'url'

const _fs = fs.promises

/**
 * @param {Response} res 
 * @@param {Object} headers
 */
const setHeaders = (res, headers) => {
  const headerEntries = Object.entries(headers)
  for (let [header, value] of headerEntries) {

    if (!header.includes('-')) header = camelToKebab(header)

    res.setHeader(header, value)
  }
}

const textResponse = (res, text) => {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.write(text)
  res.end()
}

const serveHtml = async (path, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'})

  try {
    const file = await _fs.readFile(path)
    res.write(file)
  } catch (err) {
    console.log(err)
  }

  res.end()
}

const redirect = (res, location) => {
  res.writeHead(302, {
    'Location': location,
  })
  res.end()
}

/**
 * @param {Response} res The response to set cors headers to
 */
const allowCors = res => {
  const headers = {
    accessControlAllowOrigin: '*',
    accessControlAllowMethods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    accessControlAllowHeaders: 'X-Requested-With, content-type', // custom headers
    accessControlAllowCredentials: true,
  }

  setHeaders(res, headers)
}

/**
 * Server static files
 * @param {string} publicDir 
 * @param {Request} req 
 * @param {Response} res 
 */
const staticServer = async (publicDir, req, res) => {
  let contentTypes

  try {
    const mimeFile = await _fs.readFile(pathParser.join(process.cwd(), '/util/mimes.json'), 'utf-8')
    contentTypes = JSON.parse(mimeFile)
  } catch (err) {
    console.log(err)
  }

  const url = urlParser.parse(req.url, true)
  const filePath = pathParser.join(process.cwd(), publicDir, url.pathname)

  try {
    const file = await _fs.readFile(filePath, 'binary')

    const headers = {}
    const contentType = contentTypes[pathParser.extname(filePath)]
    if (contentType) headers['Content-Type'] = contentType 

    res.writeHead(200, headers)
    res.write(file)
    res.end()

  } catch (err) {
    console.log(err)
    res.writeHead(200, {'Content-Type': 'text/plain'}); res.write('File not found'); res.end()
  }
}

/**
 * Stringify data, write and end reponse 
 * @param {*} res 
 * @param {*} data 
 */
const writeResData = (res, data) => {
  res.writeHead(200, {
    'Content-Type': 'text/json',
  })
  res.write(JSON.stringify(data))
  res.end()
}

export { setHeaders, redirect, serveHtml, textResponse, allowCors, staticServer, writeResData }