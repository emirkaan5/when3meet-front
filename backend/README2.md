**Backend README (Quick Start for Front-End Devs)**

# What this is

A minimal Express + Mongoose API for creating events and collecting availability. You can run it locally on `http://localhost:50001` and call two endpoints to build your front end.

# Prereqs

* Node 18+ and npm
* A MongoDB URI (Atlas or local)

# Setup (once)

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

# File map (what you’ll touch)

* `app.js` – Express app and route mounting
* `server.js` – boots app + DB
* `config/db.js` – Mongo connection
* `db_schema/*.js` -  Dabatabase schema
* `routes/*.js` – HTTP paths
* `controllers/*.js` – request handlers

---

# MongoDB terms

* document: a data entry
* collection: a table in SQL
* schema: an enforced data structure for entries in a collection

---

# Data model (high level)

## Event

```ts
{
  _id: ObjectId,
  title: string,
  description?: string,
  creator: string, // user id or email (string) — required
  window: { start: Date, end: Date },
  participants: [{ email: string }],
  determinedTime?: Date,
  schemaVersion: number,
  createdAt: Date,
  updatedAt: Date
}
```

## Availability

```ts
{
  _id: ObjectId,
  eventId: ObjectId, // ref Event — required
  email: string,     // required
  slots: [{ start: Date, end: Date }],
  comment?: string,
  createdAt: Date,
  updatedAt: Date
}
```
---

# API (what you can call)

## Events Endpoints

### POST `/events`

Create an event.

* **Body**

```json
{
  "title": "Sprint Planning",
  "description": "Q4 project planning",
  "creator": "alice@example.com",
  "window": { "start": "2025-10-20T13:00:00Z", "end": "2025-10-27T21:00:00Z" },
  "participants": [{ "email": "bob@example.com" }, { "email": "chen@example.com" }]
}
```

* **201** → returns created event
* **400** on validation errors

### GET `/events`

List events with optional filters & pagination.

* **Query params**: `creator`, `participant`, `from`, `to`, `search`, `page` (default 1), `limit` (default 20), `sort` (e.g. `-createdAt`)
* **200** → `{ items: Event[], page, limit, total }`

### GET `/events/:id`

Fetch single event by id.

* **200** → Event
* **404** if not found

### PATCH `/events/:id`

Partial update.

* **Body**: any subset of `title`, `description`, `window`, `participants`, `determinedTime`
* **200** → updated Event
* **409** on window validation (start≥end)

### DELETE `/events/:id`

Delete an event (soft delete if configured).

* **204** no content
* **404** if not found or not owned

### POST `/events/:id/participants`

Add or remove participants in bulk.

* **Body**

```json
{ "add": ["new@ex.com"], "remove": ["old@ex.com"] }
```

* **200** → updated participants array

### POST `/events/:id/determine`

Set a final meeting time (must fall within `window`).

* **Body**

```json
{ "determinedTime": "2025-10-23T18:00:00Z" }
```

* **200** → Event
* **422** if outside window

---

## Availabilities Endpoints

### PUT `/events/:eventId/availabilities`

Create or **upsert** the caller’s availability for an event (idempotent per `email`).

* **Body**

```json
{
  "email": "bob@example.com",
  "slots": [
    { "start": "2025-10-21T13:00:00Z", "end": "2025-10-21T14:00:00Z" },
    { "start": "2025-10-22T16:00:00Z", "end": "2025-10-22T17:30:00Z" }
  ],
  "comment": "Prefer afternoons"
}
```

* **200** → upserted Availability
* **400** if any slot start≥end or out of event window (strict mode)

### GET `/events/:eventId/availabilities`

List all availabilities for an event.

* **Query**: `email` (optional to filter one person)
* **200** → `Availability[]`

### GET `/events/:eventId/availability/:email`

Get a single person’s availability for an event.

* **200** → Availability or `{ slots: [] }` if none
* **404** if event not found

### DELETE `/events/:eventId/availability/:email`

Delete a person’s availability.

* **204**

---

# Validation & Business Rules

* `window.start < window.end`.
* `participants[].email` must be valid email.
* Availability `slots` must not overlap internally; when `strict=true` (default), each slot must fall within the event `window`.
* `determinedTime` must fall within the `window`.

---

# Changelog

* **v1.1** (2025‑10‑15): Updated routes & responses to match new CRUD controllers; clarified upsert semantics; added `/summary` endpoint and bulk participant management.
* **v1.0**: Initial draft.

---

# Postman Examples

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

# Common pitfalls (and fixes)

* 400 “validation failed”: ensure required fields are present and body is in correct JSON format (e.g. uses double quotes, add colon to separate entries).
* 403 from local testing: usually occupied port or wrong route.
* “Cannot connect to Mongo”: check `.env` `MONGODB_URI`.

---

# Notes (under development...)
