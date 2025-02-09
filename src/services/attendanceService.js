const { addDocument, getDocument, updateDocument } = require('./elasticService')
const { getCache, setCache, deleteCache, publishMessage } = require('./redisService')

const INDEX = 'attendance'

// Check-in
async function checkIn (userId, name, email) {
  const timestamp = new Date().toISOString()

  const response = await addDocument(INDEX, userId, { id: userId, name, check_in: timestamp, check_out: null })

  // Hapus cache lama di Redis dan kirim event real-time
  await deleteCache(`${INDEX}:${userId}`)
  await publishMessage('attendance_updates', JSON.stringify({ action: 'checkin', userId, name, email, timestamp }))

  return { fromCache: false, data: response }
}

// Check-out
async function checkOut (userId, name, email) {
  const timestamp = new Date().toISOString()
  const response = await updateDocument(INDEX, userId, {
    check_out: timestamp
  })

  // hapus cache lama
  await deleteCache(`${INDEX}:${userId}`)
  await publishMessage('attendance_updates', JSON.stringify({ action: 'checkout', userId, name, email, timestamp }))

  return { fromCache: false, data: response }
}

// Ambil riwayat absensi user
async function getAttendance (userId) {
  try {
    const cacheKey = `${INDEX}:${userId}`
    const cachedData = await getCache(cacheKey)
    if (cachedData) return { fromCache: true, data: JSON.parse(cachedData) }

    const response = await getDocument(INDEX, userId)
    await setCache(cacheKey, 60, JSON.stringify(response))
    return { fromCache: false, data: response }
  } catch (error) {
    return { fromCache: false, data: null }
  }
}

module.exports = { checkIn, checkOut, getAttendance }
