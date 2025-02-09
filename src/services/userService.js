const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { addDocument, getDocument, updateDocument, deleteDocument, searchDocument } = require('./elasticService')
const { getCache, setCache, deleteCache, publishMessage } = require('./redisService')

const INDEX = 'users'
const JWT_SECRET = process.env.JWT_SECRET

// Registrasi user baru
async function register (user) {
  const { name, email, password } = user
  const hashedPassword = await bcrypt.hash(password, 10)
  const timestamp = new Date().toISOString()
  const id = uuidv4()
  const response = await addDocument(INDEX, id, { id, name, email, password: hashedPassword, created_at: timestamp, updated_at: null })

  await deleteCache(`${INDEX}:${id}`)
  await publishMessage('user_updates', JSON.stringify({ action: 'create', id, name }))

  return { fromCache: false, data: response }
}

async function login (email, password) {
  const { hits } = await searchDocument({
    INDEX,
    query: { match: { email } }
  })

  if (hits.total.value === 0) return null

  const user = hits.hits[0]._source
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return null

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' })
  return { token, user }
}

// Ambil data user
async function getUser (id) {
  try {
    const cacheKey = `${INDEX}:${id}`
    const cachedData = await getCache(cacheKey)
    if (cachedData) return { fromCache: true, data: JSON.parse(cachedData) }

    const response = await getDocument(INDEX, id)
    await setCache(cacheKey, 60, JSON.stringify(response))
    return { fromCache: false, data: response }
  } catch (error) {
    return { fromCache: false, data: null }
  }
}

// Update user
async function updateUser (id, user) {
  const { name, email } = user
  const timestamp = new Date().toISOString()
  const response = await updateDocument(INDEX, id, { id, name, email, updated_at: timestamp })

  await deleteCache(`${INDEX}:${id}`)
  await publishMessage('user_updates', JSON.stringify({ action: 'update', id, name }))

  return { fromCache: false, data: response }
}

// Hapus user
async function deleteUser (id) {
  const response = await deleteDocument(INDEX, id)

  await deleteCache(`${INDEX}:${id}`)
  await publishMessage('user_updates', JSON.stringify({ action: 'delete', id }))

  return { fromCache: false, data: response }
}

module.exports = { register, login, getUser, updateUser, deleteUser }
