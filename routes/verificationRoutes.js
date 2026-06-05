const express = require('express');
const router = express.Router();

const {
    submitVerification,
    getVerificationStatus,
    approveVerification,
    rejectVerification,
    getAllVerifications
} = require('../controllers/verificationController');

// User submits verification
router.post('/submit', submitVerification);

// User checks verification status
router.get('/status/:userId', getVerificationStatus);

// Admin gets all requests
router.get('/all', getAllVerifications);

// Admin approves verification
router.put('/approve/:verificationId', approveVerification);

// Admin rejects verification
router.put('/reject/:verificationId', rejectVerification);

module.exports = router;
