
const paramsError = _ => JSON.stringify({
  success: false,
  error: 'Params Error',
  message: 'Please supply all required fields'
})

const signupEmailError = _ => JSON.stringify({
  success: false,
  error: 'Signup Email Error',
  message: 'A user with that email already exists'
})

const loginEmailError = _ => JSON.stringify({
  success: false,
  error: 'Login Email Error',
  message: 'No user or organization with that email exists'
})

const loginPasswordError = _ => JSON.stringify({
  success: false,
  error: 'Login Password Error',
  message: 'Sorry your password is wrong'
})

const dbError = _ => JSON.stringify({ 
  success: false, 
  error: 'DB Error', 
  message: 'There was a problem saving your details' 
})

const authError = _ => JSON.stringify({
  success: false,
  error: 'Authentication Error',
  message: 'Please login to continue'
})

export { 
  loginEmailError, loginPasswordError, 
  paramsError, dbError, signupEmailError, authError 
}