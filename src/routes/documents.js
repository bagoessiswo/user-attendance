const express = require('express')
const { addDocument, getDocument, searchDocument, updateDocument } = require('../services/elasticService')
const { redisClient, redisPublisher } = require('../config/redis')

const router = express.Router()

router.post('/', async (req, res) => {
  const { index, id, body } = req.body
  const response = await addDocument(index, id, body)
  await redisClient.del(`${index}:${id}`)
  await redisPublisher.publish('data_updates', JSON.stringify({ action: 'create', index, id, body }))
  res.json(response)
})

router.get('/:index/:id', async (req, res) => {
  const { index, id } = req.params
  const cacheKey = `${index}:${id}`

  const cachedData = await redisClient.get(cacheKey)
  if (cachedData) return res.json({ fromCache: true, data: JSON.parse(cachedData) })

  const response = await getDocument(index, id)
  await redisClient.setEx(cacheKey, 60, JSON.stringify(response))
  res.json({ fromCache: false, data: response })
})

router.get('/search', async (req, res) => {
  const { index, field, keyword } = req.query
  const response = await searchDocument(index, field, keyword)
  res.json(response.hits.hits)
})

router.put('/:index/:id', async (req, res) => {
  const { index, id } = req.params
  const { body } = req

  const response = await updateDocument(index, id, body)
  await redisClient.del(`${index}:${id}`)
  await redisPublisher.publish('data_updates', JSON.stringify({ action: 'update', index, id, body }))
  res.json(response)
})

module.exports = router
