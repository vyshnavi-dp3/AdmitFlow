const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const University = sequelize.define('university', {
    university_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    university_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    university_global_rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    course_program_label: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    parent_course_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  });

  return University;
};
