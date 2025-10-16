const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');       // your Express instance

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

it('creates user, event, availability', async () => {
  const userRes = await request(app)
    .post('/api/users')
    .send({ name: 'Bob', email: 'bob@test.com' })
    .expect(201);

  const userId = userRes.body._id;
  const eventRes = await request(app)
    .post('/api/events')
    .send({
      title: 'Kickoff',
      creator: userId,
      window: { start: '2025-10-12T09:00Z', end: '2025-10-13T09:00Z' },
      participants: [{ userId }]
    })
    .expect(201);

  const eventId = eventRes.body._id;
  await request(app)
    .put('/api/availability')
    .send({
      eventId,
      userId,
      timeZone: 'America/New_York',
      slots: ['2025-10-12T10:00Z']
    })
    .expect(200);
});
