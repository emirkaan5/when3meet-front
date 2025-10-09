const Event = require('../db_schema/event_model');

exports.createEvent = async (req, res) => {
  try {
    /*  expects req.body like:
        {
          title: "Project Kickoff",
          description: "Align on scope",
          creator: "60a8…",               // user ObjectId
          window: { start: "2025-10-12T09:00Z", end: "2025-10-16T18:00Z" },
          participants: [{ userId: "60a8…" }]
        }
    */
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
