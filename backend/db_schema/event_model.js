const { Schema, model } = require("mongoose");

const Event = new Schema(
  {
    title: String,
    description: String,
    creator: { type: ObjectId, ref: "User", required: true },
    window: { start: Date, end: Date, required: true }, // candidate range
    participants: [
      {
        userId: { type: ObjectId, ref: "User" },
        response: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
        gCalEventId: String,
      },
    ],
    determinedTime: Date,
    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = model("Event", Event);
