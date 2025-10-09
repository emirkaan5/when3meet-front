/* require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

(async () => {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
  });
})();
*/

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB(process.env.MONGODB_URI);

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/availability", require("./routes/availabilityRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});