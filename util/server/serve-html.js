import fs from 'fs'

const _fs = fs.promises

export default async function serveHtml(path, res) {
  res.writeHead(200, {'Content-Type': 'text/html'})

  try {
    const file = await _fs.readFile(path)
    res.write(file)
  } catch (err) {
    console.log(err)
  }

  res.end()
}