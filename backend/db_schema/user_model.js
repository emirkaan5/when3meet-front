const { Schema, model } = require("mongoose");

const User = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    googleCalendarToken: {
      access_token: String,
      refresh_token: String,
      expiry_date: Number,
    },
  },
  { timestamps: true }
);

module.exports = model("User", User);
