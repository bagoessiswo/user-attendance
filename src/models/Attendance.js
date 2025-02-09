const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')
const User = require('./User.2js')

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: 'id' } },
  check_in: { type: DataTypes.DATE },
  check_out: { type: DataTypes.DATE }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

User.hasMany(Attendance, { foreignKey: 'user_id' })
Attendance.belongsTo(User, { foreignKey: 'user_id' })

module.exports = Attendance
