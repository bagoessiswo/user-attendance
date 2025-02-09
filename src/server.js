require('dotenv').config()
const express = require('express')
require('./subscribers/redisSubscribers')

const app = express()
app.use(express.json())

// router
const reminderRoutes = require('./routes/reminders')
const documentRoutes = require('./routes/documents')

app.use('/reminders', reminderRoutes())
app.use('/documents', documentRoutes())

// Menjalankan server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
