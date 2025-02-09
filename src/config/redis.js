const redis = require('redis')

const redisClient = redis.createClient({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT })
const redisPublisher = redis.createClient({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT })
const redisSubscriber = redis.createClient({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });

(async () => {
  await redisClient.connect()
  await redisPublisher.connect()
  await redisSubscriber.connect()
})()

redisClient.on('error', (err) => console.error('Redis Error:', err))

module.exports = { redisClient, redisPublisher, redisSubscriber }
