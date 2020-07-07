import { serveHtml } from '../lib/server.js'

const Router = () => {
  const routes = []
  
  const add = (method, url, handler) => {

    const paramsRegex = /(?<=\/\:)[a-zA-Z0-9-_]+/gi
    const params = url.match(paramsRegex)

    if (params) {
      // url with params

      const regexStr = '\^' + url.replace(/(?<=\/)\:[a-zA-Z0-9-_]+/gi, '([a-zA-Z0-9-_]+)').replace(/\//g, '\\/') + '\/?' + '$'
      const regex = new RegExp(regexStr)

      const route = { method, url, handler, regex, params, }
      routes.push(route)
    } else {
      routes.push({ method, url, handler, regex: new RegExp('\^' + url + '/\?\$') })
    }
  }

  const addMultiple = (type, routesMap) => {
    for (const [route, fn] of routesMap) {
      add(type, route, fn)
    }
  }

  const find = (method, url) => {
    return routes.find(route => route.method == method && route.regex.test(url))
  }

  function handle(req, res) {
    const method = req.method.toLowerCase()
    const url = req.url.toLowerCase()
  
    const route = this.find(method, url)
  
    if (route && route.params) {
      const params = {}
      const matches = Array.from(url.matchAll(route.regex))[0].slice(1)
  
      matches.forEach((match, index) => { params[route.params[index]] = match })
      route.handler(req, res, params)
    } else if (route) {
      route.handler(req, res)
    } else {
      console.info(`${method.toUpperCase()} ${url} not found on router`)
      serveHtml('./public/404.html', res)

      // res.writeHead(200, {'Content-Type': 'text/plain'});
      // res.write('Error 404'); 
      // res.end()
    }
  }

  return {
    add,
    addMultiple,
    find,
    handle
  }
}

export { Router }