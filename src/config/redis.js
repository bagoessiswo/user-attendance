const redis = require('redis')

const redisClient = redis.createClient({ url: process.env.REDIS_CLIENT })
const redisPublisher = redis.createClient({ url: process.env.REDIS_CLIENT })
const redisSubscriber = redis.createClient({ url: process.env.REDIS_CLIENT });

(async () => {
  await redisClient.connect()
  await redisPublisher.connect()
  await redisSubscriber.connect()
})()

redisClient.on('error', (err) => console.error('Redis Error:', err))

module.exports = { redisClient, redisPublisher, redisSubscriber }
