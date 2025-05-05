// routes/index.js
const express = require('express');
const router = express.Router();

// your universityController should export an Express router
const universityController = require('./controllers/universityController');
const predictController   = require('../controllers/CollegePredictorController');

router.use('/universitys', universityController);
router.use('/predict',  predictController);

module.exports = router;
