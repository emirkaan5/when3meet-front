// availability_model.js
const { Schema, model, Types } = require("mongoose");
const ObjectId = Types.ObjectId;

const Availability = new Schema(
  {
    eventId: { type: ObjectId, ref: "Event", required: true, index: true },
    userId: { type: ObjectId, ref:"User", required: true },
    timeZone: String,
    slots: [String], // ISO strings: '2025-10-12T14:00Z' Each string represents a 15-min block
    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// one availability per (event, email)
Availability.index({ eventId: 1, email: 1 }, { unique: true });

module.exports = model("Availability", Availability);
