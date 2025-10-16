# Backend README (Quick Start for Front-End Devs)

## What this is

A minimal Express + Mongoose API for creating events and collecting availability. You can run it locally on `http://localhost:50001` and call two endpoints to build your front end.

## Prereqs

* Node 18+ and npm
* A MongoDB URI (Atlas or local)

## Setup (once)

1. Install deps
   `npm i`

2. Create `.env` in project root

```
MONGODB_URI=<your Mongo connection string>
PORT=50001
```

3. Start the API

* Dev (auto-reload): `npm run dev`
* Prod: `npm start`
  You should see: `Server listening at http://localhost:50001` and `MongoDB connected: <db-name>`

---

## File map (what you’ll touch)

* `app.js` – Express app and route mounting
* `server.js` – boots app + DB
* `config/db.js` – Mongo connection
* `db_schema/*.js` -  Dabatabase schema
* `routes/*.js` – HTTP paths
* `controllers/*.js` – request handlers

---

## MongoDB terms

* document: a data entry
* collection: a table in SQL
* schema: an enforced data structure for entries in a collection

---

## Data model (high level)

Event

* `title: String`
* `description: String`
* `creator: String` (required; unique)
* `window: { start: Date, end: Date }` (required)
* `participants: [{ email: String }]` (emails of people who responded)
* `determinedTime: Date`
* timestamps: `createdAt`, `updatedAt`

Availability (one document per participant response)

* `eventId: ObjectId` (ref Event; indexed)
* `email: String` (required, unique)
* `userName: String` (required)
* `timeZone: String`
* `slots: [String]` (ISO 8601 string e.g., `"2025-10-12T14:00Z"`)
* timestamps

**Note: current controller comments mention `userId`, but the availability schema uses `email/userName`. Use the schema fields shown above when calling the API.**

---

## API (what you can call)

Base URL (local): `http://localhost:50001`

1. Create an event
   POST `/api/events`
   Body (JSON):

```json
{
  "title": "Project Kickoff",
  "description": "Align on scope",
  "creator": "someone@test.com",
  "window": { "start": "2025-10-12T09:00:00Z", "end": "2025-10-16T18:00:00Z" },
  "participants": [ { "email": "alice@example.com" } ]
}
```

Responses

* 201 Created → the new Event document (includes `_id`, `createdAt`, `updatedAt`)
* 400 Bad Request → validation error (missing fields, bad dates)

2. Upsert (create or update) availability for an event
   PUT `/api/availability`
   Body (JSON):

```json
{
  "eventId": "6501abcd1234567890abcdef",
  "email": "bob@example.com",
  "userName": "Bob",
  "timeZone": "America/New_York",
  "slots": ["2025-10-13T14:00:00Z", "2025-10-13T14:30:00Z"]
}
```

Responses

* 200 OK → the upserted Availability document
* 400 Bad Request → validation error

Postman examples

```bash
POST http://localhost:50001/api/events
  select raw->json
  input the following to HTTP request body
  '{
    "title":"Kickoff","description":"Align",
    "creator":"someone@test.com",
    "window":{"start":"2025-10-12T09:00:00Z","end":"2025-10-16T18:00:00Z"},
    "participants":[{"email":"alice@example.com"}]
  }'

PUT http://localhost:50001/api/availability
  select raw->json
  input the following to HTTP request body
  '{
    "eventId":"6501abcd1234567890abcdef",
    "email":"bob@example.com",
    "userName":"Bob",
    "timeZone":"America/New_York",
    "slots":["2025-10-13T14:00:00Z","2025-10-13T14:30:00Z"]
  }'
```

---

## Common pitfalls (and fixes)

* 400 “validation failed”: ensure required fields are present and body is in correct JSON format (e.g. uses double quotes, add colon to separate entries).
* 403 from local testing: usually occupied port or wrong route.
* “Cannot connect to Mongo”: check `.env` `MONGODB_URI`.

---

## Notes (under development...)
