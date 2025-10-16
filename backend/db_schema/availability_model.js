// availability_model.js
const { Schema, model, Types } = require("mongoose");
const ObjectId = Types.ObjectId;

const Availability = new Schema(
  {
    eventId: { type: ObjectId, ref: "Event", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    userName: { type: String, required: true, trim: true },
    timeZone: String,
    slots: [String], // ISO strings: '2025-10-12T14:00Z'
    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

Availability.path('slots').validate(function (slots) {
  return slots.every(s => s.start < s.end);
}, 'Each availability slot must have start < end');

// one availability per (event, email)
Availability.index({ eventId: 1, email: 1 }, { unique: true });

module.exports = model("Availability", Availability);
