const express = require('express')
const { setReminder } = require('../services/redisService')

const router = express.Router()

router.post('/', async (req, res) => {
  const { id, message, delay, email } = req.body
  await setReminder(id, message, delay, email)
  res.json({ status: 'Reminder set', id, message, delay, email })
})

module.exports = router
