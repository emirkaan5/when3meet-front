// server.js
require("dotenv").config();
const { connectDB } = require("./config/db"); // make sure this path matches your actual file
const app = require("./app");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

(async () => {
  await connectDB(MONGO_URI);               // connect to Mongo (usually on 27017)
  app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
  });
})();
