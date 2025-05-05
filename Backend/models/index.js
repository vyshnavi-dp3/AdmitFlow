const Sequelize = require('sequelize');
const config = require('../config/config');
const db = {};
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize(
  config.DATABASE.NAME, config.DATABASE.USER, config.DATABASE.PASSWORD, {
  host: config.DATABASE.HOST,
  port: config.DATABASE.PORT,
  dialect: config.DATABASE.DIALECT,
  timezone: '+05:30',
  dialectOptions: {
    multipleStatements: true,
    connectTimeout: 1000 * 60 * 10
  },
  logQueryParameters: true,
  define: {
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
});

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });



module.exports = _.extend({
  sequelize,
  Sequelize,
}, db);
