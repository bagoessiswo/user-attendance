require('dotenv').config()
const express = require('express')
const { Client } = require('@elastic/elasticsearch')
const redis = require('redis')

const app = express()
app.use(express.json())

// Koneksi ke Elasticsearch
const esClient = new Client({ node: process.env.ELASTICSEARCH_CLIENT })

// Cek koneksi
esClient.ping()
  .then(() => console.log('Connected to Elasticsearch'))
  .catch(err => console.error('Elasticsearch connection error:', err))

// koneksi ke redis
const redisClient = redis.createClient({ url: process.env.REDIS_CLIENT })
const redisPublisher = redis.createClient({ url: process.env.REDIS_CLIENT })
const redisSubscriber = redis.createClient({ url: process.env.REDIS_CLIENT })

(async () => {
  await redisClient.connect()
  await redisPublisher.connect()
  await redisSubscriber.connect()
})()

redisClient.on('connect', () => console.log('Connected to Redis'))
redisClient.on('error', (err) => console.error('Redis Error:', err))

// reminder endpoint
app.post('/reminders', async (req, res) => {
  try {
    const { id, message, delay } = req.body
    const key = `reminder:${id}`

    await redisClient.setEx(key, delay, message)

    res.json({ status: 'Reminder set', id, message, delay })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

async function checkReminders () {
  const keys = await redisClient.keys('reminder:*')
  for (const key of keys) {
    const ttl = await redisClient.ttl(key)
    if (ttl === 0) {
      const message = await redisClient.get(key)
      if (message) {
        await redisPublisher.publish('reminder_alerts', JSON.stringify({ key, message }))
        await redisClient.del(key)
      }
    }
  }
}

// set interval checkreminders setiap detik
setInterval(checkReminders, 1000)

// handle alert
redisSubscriber.subscribe('reminder_alerts', (message) => {
  const data = JSON.parse(message)
  console.log(`Reminder Alert: ${data.message}`)
})

// Route untuk menambahkan data ke Elasticsearch
app.post('/documents', async (req, res) => {
  try {
    const { index, id, body } = req.body
    const response = await esClient.index({
      index,
      id,
      body
    })

    // hapus cache
    await redisClient.del(`${index}:${id}`)

    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Route untuk mendapatkan data dari Elasticsearch
app.get('/documents/:index/:id', async (req, res) => {
  try {
    const { index, id } = req.params
    const cacheKey = `${index}:${id}`

    // cek cache data redis
    const cacheData = await redisClient.get(cacheKey)
    if (cacheData) {
      return res.json({ fromCache: true, data: JSON.parse(cacheData) })
    }

    const response = await esClient.get({ index, id })

    await redisClient.setEx(cacheKey, 60, JSON.stringify(response))

    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// search
app.get('/search', async (req, res) => {
  try {
    const { index, field, keyword } = req.query
    const response = await esClient.search({
      index,
      query: {
        match: { [field]: keyword }
      }
    })
    res.json(response.hits.hits)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update Dokumen
app.put('/documents/:index/:id', async (req, res) => {
  try {
    const { index, id } = req.params
    const { body } = req
    const response = await esClient.update({
      index,
      id,
      doc: body
    })

    await redisClient.del(`$(index):${id}`)

    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Menjalankan server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
