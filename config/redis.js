const redis = require('redis')

const redisClient = redis.createClient({ url: process.env.REDIS_CLIENT, pingInterval: 1000 })
const redisPublisher = redis.createClient({ url: process.env.REDIS_CLIENT, pingInterval: 1000 })
const redisSubscriber = redis.createClient({ url: process.env.REDIS_CLIENT, pingInterval: 1000 });

(async () => {
  await redisClient.connect()
  await redisPublisher.connect()
  await redisSubscriber.connect()
})()

redisClient.on('error', (err) => console.error('Redis Error:', err))

module.exports = { redisClient, redisPublisher, redisSubscriber }
