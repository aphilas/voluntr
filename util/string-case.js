const camelToKebab = str => {
  str = str.replace(/[A-Z]/g, letter => `-${letter}`) 
  return str[0].toUpperCase() + str.slice(1)
}

export { camelToKebab }