import { uuid } from '../util/uuid.js'

let sids = []

const createSID = _ => uuid()

const storeSID = sid => sids.push(sid)

const checkSID = sid => sids.find(id => id === sid)

const deleteSID = sid => {
  sids = sids.filter(id => id != sid)
}

export { createSID, storeSID, checkSID, deleteSID }