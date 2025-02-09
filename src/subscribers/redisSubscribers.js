const { redisSubscriber } = require('../config/redis')
const sendEmail = require('../config/email')

redisSubscriber.subscribe('attendance_updates', async (message) => {
  const { action, email, name, timestamp } = JSON.parse(message)

  if (action === 'checkin') {
    sendEmail(email, 'Check-in Reminder', `Hi ${name},\n\nYou have successfully checked in at ${timestamp}.\n\nThank you!`)
  } else if (action === 'checkout') {
    sendEmail(email, 'Check-out Reminder', `Hi ${name},\n\nYou have successfully checked out at ${timestamp}.\n\nSee you next time!`)
  }
})

module.exports = redisSubscriber
