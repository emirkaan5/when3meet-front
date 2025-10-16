// controllers/availabilityController.js
const Event = require('../db_schema/event_model');
const Availability = require('../db_schema/availability_model');

exports.upsertAvailability = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { email, slots = [], note } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Validate all slots within event window
    const ok = slots.every(s => new Date(s.start) >= event.window.start && new Date(s.end) <= event.window.end && new Date(s.start) < new Date(s.end));
    if (!ok) return res.status(400).json({ error: 'All availability slots must be within the event window and start < end' });

    const availability = await Availability.findOneAndUpdate(
      { eventId, email: email.toLowerCase().trim() },
      { $set: { slots, note } },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(availability);
  } catch (err) {
    // Handle unique index errors nicely
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Availability already exists for this email and event' });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.listAvailabilitiesForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const rows = await Availability.find({ eventId }).sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const row = await Availability.findById(req.params.availabilityId);
    if (!row) return res.status(404).json({ error: 'Availability not found' });
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteAvailability = async (req, res) => {
  try {
    const row = await Availability.findByIdAndDelete(req.params.availabilityId);
    if (!row) return res.status(404).json({ error: 'Availability not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Optional: remove by event + email
exports.deleteAvailabilityByEmail = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { email } = req.body;
    const result = await Availability.findOneAndDelete({ eventId, email: email.toLowerCase().trim() });
    if (!result) return res.status(404).json({ error: 'Availability not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
