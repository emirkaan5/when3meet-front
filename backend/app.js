const express = require("express");
const availability_routes = require("./routes/availability_routes");
const event_routes = require("./routes/event_routes");

const app = express();
app.use(express.json());

app.use("/api/events", event_routes);
app.use("/api/availability", availability_routes);

module.exports = app;
