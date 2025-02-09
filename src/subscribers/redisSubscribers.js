const { redisSubscriber } = require('../config/redis')
const sendEmail = require('../config/email')

redisSubscriber.subscribe('reminder_alerts', async (message) => {
  const data = JSON.parse(message)
  console.log(`Reminder Alert: ${data.message} - Sending Email to ${data.email}`)

  if (data.email) {
    await sendEmail(data.email, 'Reminder Notification', data.message)
  }
})

module.exports = redisSubscriber
