// services/CollegePredictorService.js

const tf    = require('@tensorflow/tfjs');    // <-- pure JS runtime
const { Op } = require('sequelize');
const { Admit } = require('../models');

async function predictAdmission(input) {
  const {
    collegeId,
    greScore,
    toeflScore,
    ieltsScore,
    workExpMonths,
    noOfPapers
  } = input;

  // 1) Choose which English field to use
  let engField, engScore;
  if (toeflScore != null) {
    engField = 'toefl_score';
    engScore = toeflScore;
  } else if (ieltsScore != null) {
    engField = 'ielts_score';
    engScore = ieltsScore;
  } else {
    throw new Error('Please provide either toeflScore or ieltsScore');
  }

  // 2) Fetch admits for this college where that field is non-null
  const rows = await Admit.findAll({
    where: {
      university_id: collegeId,
      [engField]: { [Op.ne]: null }
    },
    attributes: [
      'gre_score',
      engField,
      'total_work_experience_in_months',
      'technical_papers_count',
      'admitDecision'  // 0 or 1
    ]
  });
  if (!rows.length) {
    throw new Error(`No data for college ${collegeId} with ${engField}`);
  }

  // 3) Compute maxes for normalization
  let maxGre    = greScore,
      maxEng    = engScore,
      maxExp    = workExpMonths,
      maxPapers = noOfPapers;
  rows.forEach(r => {
    if (r.gre_score > maxGre) maxGre = r.gre_score;
    if (r[engField] > maxEng) maxEng = r[engField];
    if (r.total_work_experience_in_months > maxExp)
      maxExp = r.total_work_experience_in_months;
    if (r.technical_papers_count > maxPapers)
      maxPapers = r.technical_papers_count;
  });

  // 4) Build training tensors
  const features = rows.map(r => [
    r.gre_score / maxGre,
    r[engField] / maxEng,
    r.total_work_experience_in_months / maxExp,
    r.technical_papers_count / maxPapers
  ]);
  const labels   = rows.map(r => [r.admitDecision]);

  const xTrain = tf.tensor2d(features);
  const yTrain = tf.tensor2d(labels);

  // 5) Build & compile a tiny model
  const model = tf.sequential();
  model.add(tf.layers.dense({ units:16, activation:'relu',  inputShape:[4] }));
  model.add(tf.layers.dense({ units:1,  activation:'sigmoid' }));
  model.compile({
    optimizer: tf.train.adam(),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });

  // 6) Train on the fly
  await model.fit(xTrain, yTrain, {
    epochs: 20,
    shuffle: true,
    verbose: 0
  });

  // 7) Predict your single input
  const inputTensor = tf.tensor2d([[
    greScore / maxGre,
    engScore / maxEng,
    workExpMonths / maxExp,
    noOfPapers / maxPapers
  ]]);
  const outputTensor = model.predict(inputTensor);
  const [probability] = await outputTensor.data();

  // 8) Cleanup
  tf.dispose([xTrain, yTrain, inputTensor, outputTensor, model]);

  return { probability };
}

module.exports = { predictAdmission };
