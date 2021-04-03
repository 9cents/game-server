# game-server
---
## Pre-Requisites

1. PostgreSQL database
2. Check `/src/database/db.config.js` that it is accurate to connect to your PostgreSQL database

Refer to [DatabaseSetup.md](DatabaseSetup.md) for more details

---
## Installation

`npm install`

---
## How to Run

To run server:

`npm run start`

To run server in development mode:

`npm run start:dev`

To test server:

`npm test`

---

## PostgreSQL Connection Configuration

This project uses [node-postgres](https://node-postgres.com) to connect to the PostgreSQL database.

The connection configuration can be found and changed in [src/database/db.config.js](src/database/db.config.js).

---

## API Documentation

[Reference here](https://documenter.getpostman.com/view/14723151/Tz5qZGs1)
