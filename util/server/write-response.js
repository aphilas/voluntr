const textResponse = (res, text) => {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.write(text)
  res.end()
}

export { textResponse }