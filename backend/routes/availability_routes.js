// routes/availabilityRoutes.js
const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/availability_controller');

// Upsert participant availability for an event
router.put('/events/:eventId/availabilities', ctrl.upsertAvailability); // idempotent for same email

// List & read
router.get('/events/:eventId/availabilities', ctrl.listAvailabilitiesForEvent);
router.get('/availabilities/:availabilityId', ctrl.getAvailability);

// Delete
router.delete('/availabilities/:availabilityId', ctrl.deleteAvailability);
router.delete('/events/:eventId/availabilities/by-email', ctrl.deleteAvailabilityByEmail);

module.exports = router;
