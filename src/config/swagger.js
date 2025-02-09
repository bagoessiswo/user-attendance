const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Attendance API',
      version: '1.0.0',
      description: 'API untuk sistem absensi dengan Express, MySQL, Redis, dan Elasticsearch'
    },
    servers: [
      { url: 'http://localhost:3000' }
    ]
  },
  apis: ['./src/routes/*.js']
}

const swaggerSpec = swaggerJSDoc(options)

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))
}

module.exports = setupSwagger
