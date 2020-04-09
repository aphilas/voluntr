import sqlite from 'sqlite'

let dbPromise

try {
  dbPromise = sqlite.open('./db/users.sqlite')
} catch (err) {
  console.error(err)
}

const test = (async () => {
  try {
    const db = await dbPromise

    const statement =  `CREATE TABLE users(
      id INTEGER PRIMARY KEY,
      uname TEXT,
      email TEXT,
      password TEXT
    )`

    const res = await db.run(statement)

    console.log(res)

  } catch (err) {
    console.error(err)
  }
})()