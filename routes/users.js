const express = require('express')
const { register, login, getUser, updateUser, deleteUser } = require('../services/userService')
const auth = require('../middleware/auth')

const { body, validationResult } = require('express-validator')

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API untuk autentikasi pengguna
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@gmail.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: User berhasil login
 *       400:
 *         description: Input tidak valid
 */
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { email, password } = req.body
    const response = await login({ email, password })
    if (response === null) {
      return res.status(400).json({ status: 'Login failed', data: null })
    }

    res.json({ status: 'User login', data: response })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John"
 *               email:
 *                 type: string
 *                 example: "john@gmail.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: User berhasil didaftarkan
 *       400:
 *         description: Input tidak valid
 */
router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { name, email, password } = req.body
    const response = await register({ name, email, password })

    return res.status(201).json({ status: 'User register', ...response })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User berhasil ditampilkan
 *       400:
 *         description: User tidak ditemukan
 */
router.get('/me', auth, async (req, res) => {
  const { id } = req.user
  const response = await getUser(id)

  res.json({ status: 'Get user', ...response })
})

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Update current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John"
 *               email:
 *                 type: string
 *                 example: "john@gmail.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: User berhasil diupdate
 *       400:
 *         description: Input tidak valid
 */
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
