import sqlite from 'sqlite'

const PATH = './db/users.sqlite'

const db = (async () => {
  try {
    const dbPromise = sqlite.open(PATH)
    return await dbPromise
  } catch (err) {
    console.error(err)
  }
})()

const insert = async (uname, email, pass) => {
  try {
    const statement = `INSERT INTO users (id, uname, email, password) VALUES(
      NULL, '${uname}', '${email}', '${pass}')`

    const res = await (await db).run(statement)
    return res
  } catch (err) {
    console.error(err)
  }
}

const getAll = async () => {
  try {
    const statement = `SELECT * FROM users`

    // db.get('SELECT * FROM Post WHERE id = ?', req.params.id)

    const res = await (await db).all(statement)

    return res

  } catch (err) {
    console.error(err)
  }
}

const getByEmail = async (email) => {
  try {
    const statement = `SELECT * FROM users WHERE email = '${email}'`

    // db.get('SELECT * FROM Post WHERE id = ?', req.params.id)

    const res = await (await db).get(statement)

    return res

  } catch (err) {
    console.error(err)
  }
}

export { insert, getByEmail, getAll }

