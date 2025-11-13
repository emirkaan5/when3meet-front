const express = require("express");
const availability_routes = require("./routes/availability_routes");
const event_routes = require("./routes/event_routes");
const user_routes = require("./routes/user_routes");
const cors = require("cors")

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/events", event_routes);
app.use("/api", availability_routes);
app.use("/users", user_routes);

module.exports = app;
