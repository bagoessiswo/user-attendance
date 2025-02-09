require('dotenv').config()
const express = require('express')
const { Client } = require('@elastic/elasticsearch')
const redis = require('redis')

const app = express()
app.use(express.json())

// Koneksi ke Elasticsearch
const esClient = new Client({ node: 'http://localhost:9200' })

// Cek koneksi
esClient.ping()
  .then(() => console.log('Connected to Elasticsearch'))
  .catch(err => console.error('Elasticsearch connection error:', err))

// koneksi ke redis
const redisClient = redis.createClient({ url: 'redis://redis:6379' })

redisClient.connect()

redisClient.on('connect', () => console.log('Connected to Redis'))
redisClient.on('error', (err) => console.error('Redis Error:', err))

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
