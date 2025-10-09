const router = require('express').Router();

const availCtrl = require('../controllers/availability_controller');
router.put('/', availCtrl.upsertAvailability);

module.exports = router;