// app.js
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health / root
app.get("/", (_req, res) => res.status(200).send("API is up"));
app.get("/health", (_req, res) => res.json({ ok: true }));

// Example API routes
const router = express.Router();
router.get("/users", (_req, res) => {
  // imagine a Mongo query here
  res.json([{ id: 1, name: "Test User" }]);
});
router.post("/users", (req, res) => {
  // save to Mongo, e.g., User.create(req.body)
  res.status(201).json({ created: true, body: req.body });
});
app.use("/api", router); // final paths: /api/users

// 404 handler (must be after routes)
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path, method: req.method });
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error("💥", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

module.exports = app;
