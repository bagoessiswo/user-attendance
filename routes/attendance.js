const express = require('express')
const { checkIn, checkOut, getAttendance } = require('../services/attendanceService')
const auth = require('../middleware/auth')

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: API untuk sistem absensi
 */

/**
 * @swagger
 * /attendance/checkin:
 *   post:
 *     summary: Check-in user
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Check-in berhasil
 *       401:
 *         description: Unauthorized
 */
router.post('/checkin', auth, async (req, res) => {
  try {
    const { id, name, email } = req.user
    const response = await checkIn(id, name, email)

    res.json({ status: 'Checked in', ...response })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

/**
 * @swagger
 * /attendance/checkout:
 *   post:
 *     summary: Check-out user
 *     tags: [Attendance]
 *     components:
 *       securitySchemes:
 *         bearerAuth:
 *           type: http
 *           scheme: bearer
 *           bearerFormat: JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Check-out berhasil
 *       401:
 *         description: Unauthorized
 */
router.post('/checkout', auth, async (req, res) => {
  try {
    const { id, name, email } = req.user
    const response = await checkOut(id, name, email)

    res.json({ status: 'Checked out', ...response })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Lihat riwayat absensi
router.get('/', auth, async (req, res) => {
  const { id } = req.user
  const response = await getAttendance(id)
  if (!response) return res.status(404).json({ error: 'No attendance record found' })

  res.json({ status: 'Attendance history', ...response })
})

module.exports = router
