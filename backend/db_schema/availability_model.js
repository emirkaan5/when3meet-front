const { Schema, model } = require("mongoose");

const Availability = new Schema(
  {
    eventId: { type: ObjectId, ref: "Event", index: true },
    userId: { type: ObjectId, ref: "User", index: true },
    timeZone: String,
    slots: [String], // ISO strings or switch to [{from, to}] later
  },
  { timestamps: true, schemaVersion: { type: Number, default: 1 } }
);

module.exports = model("Availability", Availability);
