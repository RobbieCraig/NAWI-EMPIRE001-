const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middleware/authMiddleware');

const authController =
    require('../controllers/authController');

/*
|--------------------------------------------------------------------------
| PROFILE MANAGEMENT
|--------------------------------------------------------------------------
*/

router.get(
    '/',
    authMiddleware,
    authController.getProfile
);

router.put(
    '/update',
    authMiddleware,
    authController.updateProfile
);

router.get(
    '/dashboard',
    authMiddleware,
    authController.getProfileDashboard
);

router.put(
    '/theme',
    authMiddleware,
    authController.updateTheme
);

router.post(
    '/merchant-evaluation',
    authMiddleware,
    authController.evaluateMerchantStatus
);

router.post(
    '/business-verification',
    authMiddleware,
    authController.submitBusinessVerification
);

router.post(
    '/password-recovery',
    authController.requestPasswordReset
);

router.post(
    '/verify-otp',
    authController.verifyOTP
);

router.post(
    '/reset-password',
    authController.resetPassword
);

module.exports = router;