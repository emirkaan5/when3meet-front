const Availability = require('../db_schema/availability_model');

exports.upsertAvailability = async (req, res) => {
  try {
    /* expects req.body:
       {
         eventId:   "6501…",
         userId:    "60a8…",
         timeZone:  "America/New_York",
         slots:     ["2025-10-13T14:00Z", "2025-10-13T14:30Z", …]
       }
    */
    const { eventId, userId, ...rest } = req.body;

    // use findOneAndUpdate with upsert:true so we CREATE if none exists
    const availability = await Availability.findOneAndUpdate(
      { eventId, userId },          // filter
      { eventId, userId, ...rest }, // replacement / update data
      { new: true, upsert: true }   // return updated doc, create if needed
    );

    res.json(availability);         // 200 OK
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
