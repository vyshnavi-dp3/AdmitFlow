// scripts/admitsloader.js

const fs   = require('fs');
const path = require('path');
const csv  = require('csv-parser');
const db   = require('../models');  // adjust to point at your Sequelize models

async function main() {
  await db.sequelize.authenticate();
  await db.sequelize.sync();
  console.log('✌️  DB connection OK');

  const filePath = path.resolve(__dirname, './cleaned_data.csv');
  const records  = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', row => {
      // Parse & validate GRE
      const gre = parseFloat(row.gre_score);
      if (isNaN(gre)) {
        console.warn(`⚠️ Skipping uni ${row.university_id}: invalid gre_score "${row.gre_score}"`);
        return;
      }

      // At least one English test
      const ielts  = row.ielts_score  ? parseFloat(row.ielts_score)  : null;
      const toefl  = row.toefl_score  ? parseFloat(row.toefl_score)  : null;
      if (ielts === null && toefl === null) {
        console.warn(`⚠️ Skipping uni ${row.university_id}: no IELTS or TOEFL score`);
        return;
      }

      // Other numeric fields
      const techPapers     = row.technical_papers_count
                              ? parseInt(row.technical_papers_count, 10)
                              : 0;
      const workExpMonths  = row.total_work_experience_in_months
                              ? parseInt(row.total_work_experience_in_months, 10)
                              : 0;
      const appStatus      = row.application_status
                              ? parseInt(row.application_status, 10)
                              : null;

      records.push({
        university_id:                    parseInt(row.university_id, 10),
        ielts_score:                      ielts,
        gre_score:                        gre,
        toefl_score:                      toefl,
        technical_papers_count:           techPapers,
        total_work_experience_in_months:  workExpMonths,
        application_status:               appStatus
      });
    })
    .on('end', async () => {
      console.log(`Parsed ${records.length} valid rows — inserting into DB…`);
      for (const rec of records) {
        try {
          await db.admit.create(rec);    // or whatever your model is called
        } catch (err) {
          console.error(`❌ Failed to insert record ${JSON.stringify(rec)}:`,
                        err.errors?.map(e=>e.message) || err.message);
        }
      }
      console.log('✅ All done');
      await db.sequelize.close();
    });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
