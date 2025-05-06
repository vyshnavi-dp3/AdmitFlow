// File: scripts/collegeloader.js
// ------------------------------
// Script to load college data from CSV into the `universities` table
// Usage: node scripts/collegeloader.js

const fs    = require('fs');
const path  = require('path');
const csv   = require('csv-parser');
require('dotenv').config();

const db        = require('../models');
const sequelize = db.sequelize;

async function loadCollegesFromCSV(filePath) {
  // 1) Ensure DB connection and table exist
  await sequelize.authenticate();
  await sequelize.sync();

  const records = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())  // default: comma-separated
      .on('data', row => {
        let rank = parseInt(row.university_global_rank, 10);
        if (isNaN(rank)) rank = null;

        records.push({
          university_id:          parseInt(row.university_id, 10),
          university_name:        row.university_name,
          university_global_rank: rank,
          course_program_label:   row.course_program_label,
          parent_course_name:     row.parent_course_name,
        });
      })
      .on('end', async () => {
        try {
          await db.university.bulkCreate(records, { ignoreDuplicates: true });
          console.log(`✅ Loaded ${records.length} colleges.`);
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

const csvFile = path.resolve(__dirname, './universities_data.csv');

loadCollegesFromCSV(csvFile)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Loading failed:', err);
    process.exit(1);
  });
