require("dotenv").config();
const { connectDB } = require("./config/db");
const app = require("./app")

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGODB_URI;

(async () => {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
  });
})();
