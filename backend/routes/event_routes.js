// routes/eventRoutes.js
const router = require('express').Router();
const ctrl = require('../controllers/event_controller');

router.post('/', ctrl.createEvent);           // POST /api/events
router.get('/', ctrl.listEvents);             // GET  /api/events?creator=...
router.get('/:eventId', ctrl.getEvent);       // GET  /api/events/:eventId
router.patch('/:eventId', ctrl.updateEvent);  // PATCH /api/events/:eventId
router.delete('/:eventId', ctrl.deleteEvent); // DELETE /api/events/:eventId

module.exports = router;
