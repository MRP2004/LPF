const express = require('express');
const { getDashboard, simulateMatch } = require('../controllers/tournamentController');

const router = express.Router();
router.get('/dashboard', getDashboard);
router.post('/simulate', simulateMatch);

module.exports = router;
