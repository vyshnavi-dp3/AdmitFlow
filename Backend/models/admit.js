const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Admit = sequelize.define('admit', {
    student_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      university_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      university_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      ielts_score: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      gre_score: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      toefl_score: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      technical_papers_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      work_experience: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      total_work_experience_in_months: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      }
  });

  return Admit;
};
