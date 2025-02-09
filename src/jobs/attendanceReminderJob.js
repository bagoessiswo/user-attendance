const cron = require('node-cron')
const { sendEmail } = require('../config/email')
const { searchDocument } = require('../services/elasticService')

const INDEX = 'users'

// Fungsi untuk mengirim reminder ke semua user
async function sendCheckInReminders () {
  try {
    // Ambil semua user dari Elasticsearch
    const { hits } = await searchDocument({
      INDEX,
      query: { match_all: {} }
    })

    for (const hit of hits.hits) {
      const user = hit._source
      await sendEmail(user.email, 'Daily Check-in Reminder',
                `Hi ${user.name},\n\nDon't forget to check in for work today!\n\nThank you!`)
    }

    console.log('Daily check-in reminders sent successfully.')
  } catch (error) {
    console.error('Error sending reminders:', error)
  }
}

// Jadwalkan reminder setiap hari pukul 07:00 pagi
cron.schedule('0 7 * * *', () => {
  console.log('Running daily check-in reminder job...')
  sendCheckInReminders()
})

module.exports = { sendCheckInReminders }
