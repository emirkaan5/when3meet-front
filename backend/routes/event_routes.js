const router = require('express').Router();

const eventCtrl = require('../controllers/event_controller');
router.post('/', eventCtrl.createEvent);

module.exports = router;