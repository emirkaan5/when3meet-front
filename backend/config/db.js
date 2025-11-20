const mongoose = require("mongoose");

async function connectDB(uri) {
  if (!uri) throw new Error("MONGODB_URI is missing");

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ MongoDB connected:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  }

  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB disconnected");
    process.exit(0);
  });
}

module.exports = { connectDB };
