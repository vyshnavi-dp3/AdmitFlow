const express = require('express');
const router  = express.Router();
const predictorService = require('../services/CollegePredictorService');

// POST /api/predict
router.post('/', async (req, res) => {
  const {
    collegeId,
    greScore,
    scoreType,   // 'ielts' or 'toefl'
    score,
    workExpMonths,
    sopScore,
    lorScore,
  } = req.body;

  // Validate fields
  if (
    typeof collegeId     !== 'number' ||
    typeof greScore      !== 'number' ||
    typeof scoreType     !== 'string' ||
    typeof score         !== 'number' ||
    typeof workExpMonths !== 'number' ||
    typeof sopScore      !== 'number' ||
    typeof lorScore      !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  if (!['ielts','toefl'].includes(scoreType.toLowerCase())) {
    return res.status(400).json({ error: "scoreType must be 'ielts' or 'toefl'" });
  }

  const englishScore = score;

  try {
    const prediction = await predictorService.predictAdmission({
      collegeId,
      greScore,
      englishScore,
      workExpMonths,
      sopScore,
      lorScore,
    });
    return res.status(200).json({ success: true, data: prediction });
  } catch (err) {
    console.error('Prediction error:', err);
    return res.status(500).json({ error: 'Failed to run prediction' });
  }
});

module.exports = router;