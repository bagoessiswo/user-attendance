const esClient = require('../config/elasticsearch')

async function addDocument (index, id, body) {
  return await esClient.index({ index, id, body })
}

async function getDocument (index, id) {
  return await esClient.get({ index, id })
}

async function searchDocument (index, field, keyword) {
  return await esClient.search({ index, query: { match: { [field]: keyword } } })
}

async function updateDocument (index, id, body) {
  return await esClient.update({ index, id, doc: body })
}

module.exports = { addDocument, getDocument, searchDocument, updateDocument }
