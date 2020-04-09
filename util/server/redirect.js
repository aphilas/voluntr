
const redirect = (res, location) => {
  res.writeHead(302, {
    'Location': location,
  })
  res.end()
}

export { redirect }