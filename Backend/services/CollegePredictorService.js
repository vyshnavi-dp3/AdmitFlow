// services/CollegePredictorService.js

// ensure deterministic Math.random
const seedrandom = require('seedrandom');
seedrandom('my-fixed-seed', { global: true });

const tf    = require('@tensorflow/tfjs');
const { Op } = require('sequelize');
const db    = require('../models');

async function predictAdmission(input) {
  const {
    collegeId,
    greScore,
    scoreType,     // 'ielts' or 'toefl'
    score: engScore,
    workExpMonths,
    sopScore,
    lorScore,
    noOfPapers
  } = input;

  // 1) pick the right English field
  let engField;
  if (scoreType === 'toefl')      engField = 'toefl_score';
  else if (scoreType === 'ielts') engField = 'ielts_score';
  else throw new Error('scoreType must be "ielts" or "toefl"');

  // 2) load all prior admits/rejects for this college
  const rawRows = await db.admit.findAll({
    where: {
      university_id: collegeId,
      [engField]:    { [Op.ne]: null }
    },
    attributes: [
      'gre_score',
      engField,
      'total_work_experience_in_months',
      'technical_papers_count',
      'application_status'
    ]
  });

  // 3) map into { gre, eng, exp, papers, admit } and filter out any status ≠ 6 or 7
  const records = rawRows
    .map(r => {
      const status = r.application_status;
      if (status !== 6 && status !== 7) return null;
      return {
        gre:    r.gre_score,
        eng:    r[engField],
        exp:    r.total_work_experience_in_months,
        papers: r.technical_papers_count,
        admit:  status === 6 ? 1 : 0
      };
    })
    .filter(Boolean);

  if (records.length === 0) {
    throw new Error(`No valid admit/reject records for college ${collegeId}`);
  }

  // 4) find max of each feature (including the new applicant) for normalization
  let maxGre    = greScore,
      maxEng    = engScore,
      maxExp    = workExpMonths,
      maxPapers = noOfPapers;
  for (const r of records) {
    if (r.gre    > maxGre)    maxGre    = r.gre;
    if (r.eng    > maxEng)    maxEng    = r.eng;
    if (r.exp    > maxExp)    maxExp    = r.exp;
    if (r.papers > maxPapers) maxPapers = r.papers;
  }

  // 5) build tensors
  const features = records.map(r => [
    r.gre    / maxGre,
    r.eng    / maxEng,
    r.exp    / maxExp,
    r.papers / maxPapers
  ]);
  const labels = records.map(r => [ r.admit ]);

  const xTrain = tf.tensor2d(features);
  const yTrain = tf.tensor2d(labels);

  // 6) build & compile the same small network (fixed seed in init)
  const seed = 42;
  const init = tf.initializers.glorotUniform({ seed });
  const zeros = tf.initializers.zeros();

  const model = tf.sequential();
  model.add(tf.layers.dense({
    units:             16,
    activation:        'relu',
    inputShape:       [4],
    kernelInitializer: init,
    biasInitializer:   zeros
  }));
  model.add(tf.layers.dense({
    units:             1,
    activation:        'sigmoid',
    kernelInitializer: init,
    biasInitializer:   zeros
  }));
  model.compile({
    optimizer: tf.train.adam(),
    loss:      'binaryCrossentropy',
    metrics:   ['accuracy']
  });

  // 7) train without shuffling
  await model.fit(xTrain, yTrain, {
    epochs:  20,
    shuffle: false,
    verbose: 0
  });

  // 8) predict on the new candidate
  const inputTensor = tf.tensor2d([[
    greScore      / maxGre,
    engScore      / maxEng,
    workExpMonths / maxExp,
    noOfPapers    / maxPapers
  ]]);
  const [modelProb] = await model.predict(inputTensor).data();

  // 9) blend in SOP/LOR (30% weight)
  const maxExternal = 10;
  const extAvg = ((sopScore / maxExternal) + (lorScore / maxExternal)) / 2;
  const finalProb = 0.7 * modelProb + 0.3 * extAvg;

  // 10) cleanup
  tf.dispose([xTrain, yTrain, inputTensor]);
  model.dispose();

  return {
    probability:      finalProb,
    trainingRecords:  records
  };
}

module.exports = { predictAdmission };
