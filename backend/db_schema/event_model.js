const { Schema, model, Types } = require('mongoose');
const ObjectId = Types.ObjectId;

const Event = new Schema(
  {
    title: String,
    description: String,
    creator: { type: ObjectId, ref: "User", required: true }, // ObjectID: 24-char ID pointing to another collection's document
    window: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    }, // time range
    participants: [
      {
        email: { type: string, ref: "Availability", required: true },
      }, // record users who have filled availability
    ],
    determinedTime: Date,
    schemaVersion: { type: Number, default: 1 }, // in case we change structure of the collection, allows for easy migrations
  },
  { timestamps: true }
);

module.exports = model("Event", Event);
