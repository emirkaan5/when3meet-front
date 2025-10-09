const { Schema, model, Types } = require('mongoose');
const ObjectId = Types.ObjectId;

const Availability = new Schema(
  {
    eventId: { type: ObjectId, ref: "Event", index: true },
    userId: { type: ObjectId, ref: "User", index: true },
    timeZone: String,
    slots: [String], // array of ISO strings like '2025-10-12T14:00', each represents 15-min block of free time,
    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = model("Availability", Availability);
