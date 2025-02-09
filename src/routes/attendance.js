const express = require('express')
const { checkIn, checkOut, getAttendance } = require('../services/attendanceService')
const auth = require('../middleware/auth')

const router = express.Router()

// Check-in
router.post('/checkin', auth, async (req, res) => {
  const { id, name, email } = req.user
  const response = await checkIn(id, name, email)

  res.json({ status: 'Checked in', ...response })
})

// Check-out
router.post('/checkout', auth, async (req, res) => {
  const { id, name, email } = req.user
  const response = await checkOut(id, name, email)

  res.json({ status: 'Checked out', ...response })
})

// Lihat riwayat absensi
router.get('/', auth, async (req, res) => {
  const { id } = req.user
  const response = await getAttendance(id)
  if (!response) return res.status(404).json({ error: 'No attendance record found' })

  res.json({ status: 'Attendance history', ...response })
})

module.exports = router
