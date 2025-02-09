const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { addDocument, getDocument, updateDocument, deleteDocument } = require('./elasticService')
const { getCache, setCache, deleteCache, publishMessage } = require('./redisService')

const Models = require('../models/index')
const User = Models.user

const INDEX = 'users'
const JWT_SECRET = process.env.JWT_SECRET

// Registrasi user baru
async function register (user) {
  const { name, email, password } = user
  const hashedPassword = await bcrypt.hash(password, 10)

  const existedUser = await User.findOne({
    where: { email }
  })

  if (existedUser) {
    return { fromCache: false, data: null }
  }

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword
  })

  const id = newUser.id
  const timestamp = newUser.created_at
  await addDocument(INDEX, id, { name, email, password: hashedPassword, created_at: timestamp, updated_at: null })

  await deleteCache(`${INDEX}:${id}`)
  await publishMessage('user_updates', JSON.stringify({ action: 'register', id, name, email }))

  return { fromCache: false, data: newUser }
}

async function login (credentials) {
  const { email, password } = credentials
  const user = await User.findOne({
    where: {
      email
    }
  })

  if (!user) return null

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

    const response = (await getDocument(INDEX, id))._source
    await setCache(cacheKey, 60, JSON.stringify(response))
    return { fromCache: false, data: response }
  } catch (error) {
    return { fromCache: false, data: null }
  }
}

// Update user
async function updateUser (id, user) {
  const { name, email, password } = user
  const hashedPassword = await bcrypt.hash(password, 10)
  const timestamp = new Date().toISOString()
  const existedUser = await User.findOne({
    where: { id }
  })
  if (!existedUser) {
    return { fromCache: false, data: null }
  }
  await User.update({
    name,
    email,
    password: hashedPassword
  }, {
    where: {
      id
    }
  })

  await updateDocument(INDEX, id, { name, email, password: hashedPassword, updated_at: timestamp })

  await deleteCache(`${INDEX}:${id}`)
  await publishMessage('user_updates', JSON.stringify({ action: 'update', id, name, email }))

  return {
    fromCache: false,
    data: {
      id,
      name,
      email,
      password: hashedPassword
    }
  }
}

// Hapus user
async function deleteUser (id) {
  await User.destroy({
    where: {
      id
    }
  })
  await deleteDocument(INDEX, id)

  await deleteCache(`${INDEX}:${id}`)
  await publishMessage('user_updates', JSON.stringify({ action: 'delete', id }))

  return { fromCache: false }
}

module.exports = { register, login, getUser, updateUser, deleteUser }
