// scripts/admitsloader.js

const fs   = require('fs');
const path = require('path');
const csv  = require('csv-parser');
const db   = require('../models');  // your models/index.js

async function main() {
  await db.sequelize.authenticate();
  await db.sequelize.sync();
  console.log('✌️  DB connection OK');

  const filePath = path.resolve(__dirname, './final_pp.csv');
  const records  = [];

  function tryParseJSON(txt) {
    if (typeof txt !== 'string') return null;
    const s = txt.trim();
    if (s.startsWith('{') || s.startsWith('[')) {
      try { return JSON.parse(s); } catch {}
    }
    return txt;
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', row => {
      // 1) ensure GRE is valid
      const gre = parseFloat(row.gre_score);
      if (isNaN(gre)) {
        console.warn(`⚠️ Skipping student ${row.student_id}: invalid gre_score "${row.gre_score}"`);
        return;
      }

      // 2) ensure at least one English test
      const ielts = row.ielts_score  ? parseFloat(row.ielts_score)  : null;
      const toefl = row.toefl_score  ? parseFloat(row.toefl_score)  : null;
      if (ielts === null && toefl === null) {
        console.warn(`⚠️ Skipping student ${row.student_id}: no IELTS or TOEFL score`);
        return;
      }

      // 3) stringify & truncate work_experience into a 255-char string
      const rawWorkExp = tryParseJSON(row.work_experience);
      let workExpStr = '';
      if (typeof rawWorkExp === 'string') {
        workExpStr = rawWorkExp;
      } else if (rawWorkExp) {
        let j = JSON.stringify(rawWorkExp);
        if (j.length > 255) j = j.slice(0, 252) + '...';
        workExpStr = j;
      }

      // 4) minimal ranks metadata
      const rawRanks = tryParseJSON(row.ranks_and_metadata);
      let minimalRanks = null;
      if (rawRanks && typeof rawRanks === 'object') {
        const {
          status_rank,
          intake_rank,
          testimonial_rank,
          term,
          year,
          level,
          user_stage
        } = rawRanks;
        minimalRanks = { status_rank, intake_rank, testimonial_rank, term, year, level, user_stage };
      }

      // 5) assemble only the fields your model declares (omit student_id)
      records.push({
        university_id:                   parseInt(row.university_id, 10),
        university_name:                 row.university_name,
        username:                        row.username,
        ielts_score:                     ielts,
        gre_score:                       gre,
        toefl_score:                     toefl,
        technical_papers_count:          row.technical_papers_count
                                          ? parseInt(row.technical_papers_count, 10)
                                          : 0,
        work_experience:                 workExpStr,
        total_work_experience_in_months: row.total_work_experience_in_months
                                          ? parseInt(row.total_work_experience_in_months, 10)
                                          : 0,
        metadata: {
          bachelors_college:   row.bachelors_college,
          bachelors_course:    row.bachelors_course,
          course_preferences:  tryParseJSON(row.course_preferences),
          ranks_and_metadata:  minimalRanks
        }
      });
    })
    .on('end', async () => {
      console.log(`Parsed ${records.length} valid rows — inserting into DB…`);
      for (const rec of records) {
        try {
          // now create without supplying student_id
          await db.admit.create(rec);
        } catch (err) {
          console.error(`❌ Failed to insert a record:`, err.errors?.map(e=>e.message) || err.message);
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
