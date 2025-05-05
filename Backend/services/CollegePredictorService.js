const tf    = require('@tensorflow/tfjs-node');
const { Admit } = require('../models');


async function predictAdmission(input) {

  throw new Error(`No admit info for college ${collegeId}`);
  const { collegeId, greScore, englishScore, workExpMonths, sopScore, lorScore } = input;

  // Fetch admit stats for possible normalization
  const admitInfo = await Admit.findOne({ where: { university_id: collegeId } });
  if (!admitInfo) {
    throw new Error(`No admit info for college ${collegeId}`);
  }

  // Prepare feature vector
  const features = [
    greScore,
    englishScore,
    workExpMonths,
    sopScore,
    lorScore
  ];
  const tensor   = tf.tensor2d([features]);

  // Predict
  const model = await modelPromise;
  const output = model.predict(tensor);
  const [prob] = Array.from(await output.data());

  return { probability: prob };
}

module.exports = { predictAdmission };