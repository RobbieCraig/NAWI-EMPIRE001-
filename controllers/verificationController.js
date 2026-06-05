const User = require('../models/User');
const Verification = require('../models/Verification');

/**
 * DAY 1 VIDEO LOCK VERIFICATION
 */
exports.submitVideoVerification = async (req, res) => {
    try {
        const user = await User.findOne({
            userId: req.user.userId
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Citizen profile not found.'
            });
        }

        const videoUrl = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        if (!videoUrl) {
            return res.status(400).json({
                success: false,
                message: 'Verification video required.'
            });
        }

        await Verification.create({
            userId: user.userId,
            verificationType: 'DAY_1_VIDEO_LOCK',
            status: 'PENDING',
            documents: [videoUrl]
        });

        user.identity.id_verified = true;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Video verification submitted.'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * BUSINESS / TIER 3 APPLICATION
 */
exports.submitBusinessVerification = async (req, res) => {
    try {

        const {
            businessName,
            cacNumber
        } = req.body;

        const user = await User.findOne({
            userId: req.user.userId
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Citizen profile not found.'
            });
        }

        const verification = await Verification.create({
            userId: user.userId,
            verificationType: 'SOVEREIGN_CHALLENGER',
            businessName,
            cacNumber,
            status: 'PENDING'
        });

        return res.status(201).json({
            success: true,
            verification
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * ADMIN APPROVAL
 */
exports.approveVerification = async (req, res) => {

    try {

        const { verificationId } = req.params;

        const verification =
            await Verification.findById(verificationId);

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Verification record not found.'
            });
        }

        verification.status = 'APPROVED';
        verification.reviewedAt = new Date();
        verification.reviewedBy = req.user.userId;

        await verification.save();

        const user = await User.findOne({
            userId: verification.userId
        });

        if (user) {

            if (
                verification.verificationType ===
                'SOVEREIGN_CHALLENGER'
            ) {
                user.current_tier = 3;
            }

            user.identity.id_verified = true;

            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Verification approved.'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * ADMIN REJECTION
 */
exports.rejectVerification = async (req, res) => {

    try {

        const { verificationId } = req.params;
        const { reason } = req.body;

        const verification =
            await Verification.findById(verificationId);

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Verification record not found.'
            });
        }

        verification.status = 'REJECTED';
        verification.rejectionReason =
            reason || 'Verification rejected';

        verification.reviewedAt = new Date();

        await verification.save();

        return res.status(200).json({
            success: true,
            message: 'Verification rejected.'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * GET USER VERIFICATION STATUS
 */
exports.getVerificationStatus = async (req, res) => {

    try {

        const records = await Verification.find({
            userId: req.user.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: records.length,
            records
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
