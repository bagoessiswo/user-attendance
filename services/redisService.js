const { redisClient, redisPublisher } = require('../config/redis')

async function getCache (cacheKey) {
  const data = await redisClient.get(cacheKey)
  return data
}

async function setCache (cacheKey, delay, value) {
  await redisClient.setEx(cacheKey, delay, value)
}

async function deleteCache (cacheKey) {
  await redisClient.del(cacheKey)
}

async function publishMessage (channel, message) {
  await redisPublisher.publish(channel, message)
}

async function getKeys (index) {
  const keys = await redisClient.keys(`${index}:*`)
  return keys
}

async function getTtl (key) {
  const ttl = await redisClient.ttl(key)

  return ttl
}

module.exports = { getCache, setCache, deleteCache, publishMessage, getKeys, getTtl }
