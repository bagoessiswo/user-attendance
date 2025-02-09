const express = require('express')
const { register, login, getUser, updateUser, deleteUser } = require('../services/userService')
const auth = require('../middleware/auth')

const router = express.Router()

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const response = await login({ email, password })
  if (response === null) {
    return res.status(400).json({ status: 'Login failed', data: null })
  }

  res.json({ status: 'User login', data: response })
})

// Registrasi user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  const response = await register({ name, email, password })

  res.json({ status: 'User register', ...response })
})

// Ambil data user
router.get('/me', auth, async (req, res) => {
  const { id } = req.user
  const response = await getUser(id)

  res.json({ status: 'Get user', ...response })
})

// Update user
router.put('/me', auth, async (req, res) => {
  const { id } = req.user
  const updateData = req.body

  const response = await updateUser(id, updateData)

  res.json({ status: 'User updated', ...response })
})

// Hapus user
router.delete('/me', auth, async (req, res) => {
  const { id } = req.user
  const response = await deleteUser(id)

  res.json({ status: 'User deleted', ...response })
})

module.exports = router
