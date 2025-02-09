const esClient = require('../config/elasticsearch')

async function addDocument (index, id, body) {
  return await esClient.index({ index, id, body })
}

async function getDocument (index, id) {
  return await esClient.get({ index, id })
}

async function searchDocument (index, query) {
  return await esClient.search({ index, query })
}

async function updateDocument (index, id, body) {
  return await esClient.update({ index, id, doc: body })
}

async function deleteDocument (index, id) {
  return await esClient.delete({ index, id })
}

async function deleteIndex (index) {
  return await esClient.indices.delete({ index })
}

module.exports = { addDocument, getDocument, searchDocument, updateDocument, deleteDocument, deleteIndex }
