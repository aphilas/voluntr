
const undef = (...args) => args.some(arg => (typeof arg) == 'undefined')

export { undef }