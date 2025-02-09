const { Client } = require('@elastic/elasticsearch')

const esClient = new Client({ node: process.env.ELASTICSEARCH_CLIENT })

module.exports = esClient
