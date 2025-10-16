// controllers/eventController.js
const Event = require('../db_schema/event_model');
const Availability = require('../db_schema/availability_model');

exports.createEvent = async (req, res) => {
  try {
    const { title, description, creator, window, participants = [] } = req.body;

    if (!window?.start || !window?.end) {
      return res.status(400).json({ error: 'window.start and window.end are required' });
    }

    const event = await Event.create({
      title,
      description,
      creator,
      window,
      participants,
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listEvents = async (req, res) => {
  try {
    // Optional filtering by creator ?creator=alice@example.com
    const filter = {};
    if (req.query.creator) filter.creator = req.query.creator;

    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const allowed = ['title', 'description', 'window', 'participants', 'determinedTime'];
    const updates = {};
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];

    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // If updating window, ensure logical order
    if (updates.window) {
      const { start, end } = updates.window;
      if (!(start && end && new Date(start) < new Date(end))) {
        return res.status(400).json({ error: 'Invalid event window' });
      }
    }

    Object.assign(event, updates);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Cascade: delete all availabilities for this event
    await Availability.deleteMany({ eventId: event._id });

    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
