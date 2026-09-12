const express = require('express');
const router = express.Router();
const { getSeatsByFlight, generateSeats, updateSeat } = require('../controllers/seatController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/flight/:flightId', getSeatsByFlight);

// أدمن فقط
router.post('/generate/:flightId', protect, admin, generateSeats);
router.put('/:id', protect, admin, updateSeat);

module.exports = router;
