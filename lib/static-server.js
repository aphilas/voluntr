import urlParser from 'url'
import fs from 'fs'
import pathParser from 'path'

const _fs = fs.promises

const staticRouter = async (publicDir, req, res) => {
  let contentTypes

  try {
    const mimeFile = await _fs.readFile(pathParser.join(process.cwd(), '/util/server/mimes.json'), 'utf-8')
    contentTypes = JSON.parse(mimeFile)
  } catch (err) {
    console.log(err)
  }

  const url = urlParser.parse(req.url, true)
  const filePath = pathParser.join(process.cwd(), publicDir, url.pathname)

  try {
    // const fileStat = await _fs.fstat(filePath)
    // if (fileStat.isDirectory()) filePath += 'index.html'

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

export { staticRouter }