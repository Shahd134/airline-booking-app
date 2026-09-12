const express = require('express');
const router = express.Router();
const { getAirports, createAirport } = require('../controllers/airportController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', getAirports);
router.post('/', protect, admin, createAirport);

module.exports = router;
