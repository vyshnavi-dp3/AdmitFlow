// routes/index.js
const express = require('express');
const router = express.Router();

// your universityController should export an Express router
const universityController = require('./controllers/universityController');

router.use('/universitys', universityController);

module.exports = router;
