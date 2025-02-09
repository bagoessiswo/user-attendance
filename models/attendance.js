'use strict'

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('attendance', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: DataTypes.UUID,
    check_in: DataTypes.DATE,
    check_out: DataTypes.DATE
  }, {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  Attendance.associate = (models) => {
    // associations can be defined here

  }

  return Attendance
}
