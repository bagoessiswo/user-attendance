require('dotenv').config()
const express = require('express')
require('./subscribers/redisSubscriber')
require('./jobs/attendanceReminderJob')

const app = express()
app.use(express.json())

// router
const attendanceRoutes = require('./routes/attendance')
const userRoutes = require('./routes/users')

app.use('/attendances', attendanceRoutes)
app.use('/users', userRoutes)

// Menjalankan server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
