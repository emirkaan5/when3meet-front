const { Schema, model, Types } = require("mongoose");

const Event = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    creator: { type: String, required: true, lowercase: true, trim: true },
    window: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    // time range
    participants: [
      {
        email: { type: String, lowercase: true, trim: true },
      },
    ],
    // record users who have filled availability
    determinedTime: Date,
    schemaVersion: { type: Number, default: 1 },
    // in case we change structure of the collection, allows for easy migrations
  },
  { timestamps: true }
);

// Event.path("window").validate(function (val) {
//   return val?.start && val?.end && val.start < val.end;
// }, "Event window.start must be earlier than window.end");

module.exports = model("Event", Event);
