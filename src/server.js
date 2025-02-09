require('dotenv').config()
const express = require('express')
const setupSwagger = require('./config/swagger')
require('./subscribers/redisSubscriber')
require('./jobs/attendanceReminderJob')

const app = express()
app.use(express.json())
setupSwagger(app)
// router
const attendanceRoutes = require('./routes/attendance')
const userRoutes = require('./routes/users')

app.use('/attendance', attendanceRoutes)
app.use('/auth', userRoutes)

// Menjalankan server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
