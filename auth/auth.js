import { getAll, getByEmail, insert as insertUser } from '../db/db.js'

function signUp(uname, email, pass) {
  insertUser(uname, email, pass)

  return {
    success: true,
    redirect: 'login'
  }
}