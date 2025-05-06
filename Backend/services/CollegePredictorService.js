// services/CollegePredictorService.js

// Ensure deterministic Math.random
const seedrandom = require('seedrandom');
seedrandom('my-fixed-seed', { global: true });

const tf    = require('@tensorflow/tfjs');    // pure-JS TF
const { Op } = require('sequelize');
const db    = require('../models');

async function predictAdmission(input) {
  const {
    collegeId,
    greScore,
    scoreType,     // 'ielts' or 'toefl'
    score,         // the corresponding English score
    workExpMonths,
    sopScore,
    lorScore,
    noOfPapers
  } = input;

  // 1) Choose English field
  let engField;
  if (scoreType === 'toefl') engField = 'toefl_score';
  else if (scoreType === 'ielts') engField = 'ielts_score';
  else throw new Error('scoreType must be "ielts" or "toefl"');
  const engScore = score;

  // 2) Fetch history
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
      'metadata'
    ]
  });

  // 3) Extract & filter records by matching application_status (6=admit,7=reject)
  const records = rawRows.flatMap(r => {
    const meta = r.metadata || {};
    let apps = Array.isArray(meta.university_applications)
               ? meta.university_applications
               : meta.ranks_and_metadata?.total_profile?.university_applications;
    if (!Array.isArray(apps)) return [];
    const app = apps.find(a => Number(a.university_id) === collegeId);
    if (!app) return [];
    const status = app.application_status;
    if (status !== 6 && status !== 7) return [];
    return [{
      gre:    r.gre_score,
      eng:    r[engField],
      exp:    r.total_work_experience_in_months,
      papers: r.technical_papers_count,
      admit:  status === 6 ? 1 : 0
    }];
  });

  if (!records.length) {
    throw new Error(`No valid records for college ${collegeId}`);
  }

  // 4) Compute max values (including input)
  let maxGre    = greScore,
      maxEng    = engScore,
      maxExp    = workExpMonths,
      maxPapers = noOfPapers;
  records.forEach(r => {
    if (r.gre    > maxGre)    maxGre    = r.gre;
    if (r.eng    > maxEng)    maxEng    = r.eng;
    if (r.exp    > maxExp)    maxExp    = r.exp;
    if (r.papers > maxPapers) maxPapers = r.papers;
  });

  // 5) Build training tensors
  const features = records.map(r => [
    r.gre    / maxGre,
    r.eng    / maxEng,
    r.exp    / maxExp,
    r.papers / maxPapers
  ]);
  const labels = records.map(r => [ r.admit ]);

  const xTrain = tf.tensor2d(features);
  const yTrain = tf.tensor2d(labels);

  // 6) Build model with fixed seed
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

  // 7) Train without shuffling
  await model.fit(xTrain, yTrain, {
    epochs:  20,
    shuffle: false,
    verbose: 0
  });

  // 8) Predict
  const inputTensor = tf.tensor2d([[
    greScore      / maxGre,
    engScore      / maxEng,
    workExpMonths / maxExp,
    noOfPapers    / maxPapers
  ]]);
  const [modelProb] = await model.predict(inputTensor).data();

  // 9) Combine with SOP/LOR (30%)
  const maxExternalScore = 10;
  const extAvg = ((sopScore / maxExternalScore) + (lorScore / maxExternalScore)) / 2;
  const finalProb = 0.7 * modelProb + 0.3 * extAvg;

  // 10) Cleanup
  tf.dispose([xTrain, yTrain, inputTensor]);
  model.dispose();

  // Return both the final probability and all training records
  return {
    probability: finalProb,
    trainingRecords: records
  };
}

module.exports = { predictAdmission };
