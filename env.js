import fs from 'fs'

const loadEnv = _ => {
  const file = fs.readFileSync('./env.json', { encoding: 'utf-8' })
  const config = JSON.parse(file)

  for (const [key, value] of Object.entries(config)) {
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) { 
      process.env[key] = value
    }
  }
}

export { loadEnv }