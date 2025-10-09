const { Schema, model, Types } = require("mongoose");

const Availability = new Schema(
  {
    eventId: { type: Types.ObjectId, ref: "Event", required: true, index: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    timeZone: { type: String, default: "UTC" },
    slots: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true }
      }
    ], // Array of time slots
    source: { type: String, enum: ["manual", "google_calendar"], default: "manual" },
  },
  { timestamps: true }
);

// Compound index for efficient queries
Availability.index({ eventId: 1, userId: 1 });

module.exports = model("Availability", Availability);
