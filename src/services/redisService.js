const { redisClient, redisPublisher } = require('../config/redis')

async function setReminder (id, message, delay, email) {
  const key = `reminder:${id}`
  await redisClient.setEx(key, delay, JSON.stringify({ message, email }))
}

async function getExpiredReminders () {
  const keys = await redisClient.keys('reminder:*')
  for (const key of keys) {
    const ttl = await redisClient.ttl(key)
    if (ttl === 0) {
      const reminderData = await redisClient.get(key)
      if (reminderData) {
        const { message, email } = JSON.parse(reminderData)
        await redisPublisher.publish('reminder_alerts', JSON.stringify({ key, message, email }))
        await redisClient.del(key)
      }
    }
  }
}

module.exports = { setReminder, getExpiredReminders }
