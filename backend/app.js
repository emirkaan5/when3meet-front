const express = require('express');
const app = express();

app.use(express.json());
app.use('/api/events',       require('./routes/event_routes'));
app.use('/api/users',        require('./routes/user_routes'));
app.use('/api/availability', require('./routes/availability_routes'));

module.exports = app;
