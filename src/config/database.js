const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
})

async function connectDB () {
  try {
    await sequelize.authenticate()
    console.log('Connected to MySQL')
  } catch (error) {
    console.error('Unable to connect to MySQL:', error)
  }
}

module.exports = { sequelize, connectDB }
