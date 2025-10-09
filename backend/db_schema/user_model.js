const { Schema, model } = require("mongoose");

const User = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
  },
  { timestamps: true } // auto-create 'createdAt' and 'updatedAT' fields for every document
);

module.exports = model("User", User);
