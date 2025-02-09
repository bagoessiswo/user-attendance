const { addDocument, getDocument, updateDocument } = require('./elasticService.js')
const { getCache, setCache, deleteCache, publishMessage } = require('./redisService.js')
const Models = require('../models/index.js')
const Attendance = Models.attendance

const INDEX = 'attendance'

// Check-in
async function checkIn (userId, name, email) {
  const timestamp = new Date().toISOString()

  // Simpan di MySQL
  const attendance = await Attendance.create({ user_id: userId, check_in: timestamp, check_out: null })

  await addDocument(INDEX, attendance.id, { user_id: userId, name, check_in: timestamp, check_out: null })

  // Hapus cache lama di Redis dan kirim event real-time
  await deleteCache(`${INDEX}:${userId}`)
  await publishMessage('attendance_updates', JSON.stringify({ action: 'checkin', userId, name, email, timestamp }))

  return { fromCache: false, data: attendance }
}

// Check-out
async function checkOut (userId, name, email) {
  const timestamp = new Date().toISOString()

  // Update di MySQL
  const attendance = await Attendance.findOne({ where: { user_id: userId, check_out: null } })
  if (!attendance) throw new Error('No active check-in found')

  attendance.check_out = timestamp
  await attendance.save()

  await updateDocument(INDEX, attendance.id, {
    check_out: timestamp
  })

  // hapus cache lama
  await deleteCache(`${INDEX}:${userId}`)
  await publishMessage('attendance_updates', JSON.stringify({ action: 'checkout', userId, name, email, timestamp }))

  return { fromCache: false, data: attendance }
}

// Ambil riwayat absensi user
async function getAttendance (userId) {
  try {
    const cacheKey = `${INDEX}:${userId}`
    const cachedData = await getCache(cacheKey)
    if (cachedData) return { fromCache: true, data: JSON.parse(cachedData) }

    const response = (await getDocument(INDEX, userId))._source
    await setCache(cacheKey, 60, JSON.stringify(response))
    return { fromCache: false, data: response }
  } catch (error) {
    return { fromCache: false, data: null }
  }
}

module.exports = { checkIn, checkOut, getAttendance }
