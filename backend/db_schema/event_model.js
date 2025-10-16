const { Schema, model, Types } = require("mongoose");

const Event = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    creator: { type: Types.ObjectId, ref: "User", required: true },
    window: { 
      start: { type: Date, required: true }, 
      end: { type: Date, required: true }
    },
    participants: [
      {
        userId: { type: Types.ObjectId, ref: "User" },
        response: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
        gCalEventId: String,
      },
    ],
    determinedTime: {
      start: Date,
      end: Date
    },
    status: {
      type: String,
      enum: ["draft", "active", "finalized", "cancelled"],
      default: "active"
    },
  },
  { timestamps: true }
);

module.exports = model("Event", Event);
