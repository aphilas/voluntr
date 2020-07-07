const encodeFormData = formData => {
  let str = ''

  const encode = str => encodeURIComponent(str).replace(/%20/g, '+')

  for (let [key, value] of formData) {
    if(typeof value =='string') str += (str ? '&' : '') + encode(key) + '=' + encode(value)
  }

  return str
}

export { encodeFormData }