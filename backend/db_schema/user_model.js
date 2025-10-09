const { Schema, model } = require("mongoose");

const User = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

module.exports = model("User", User);
