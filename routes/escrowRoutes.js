const express =
    require('express');

const router =
    express.Router();

const auth =
    require(
        '../middleware/authMiddleware'
    );

const escrowController =
    require(
        '../controllers/escrowController'
    );

router.post(
    '/',
    auth,
    escrowController.createEscrow
);

router.get(
    '/',
    auth,
    escrowController.getEscrows
);

router.put(
    '/release/:id',
    auth,
    escrowController.releaseEscrow
);

module.exports = router;