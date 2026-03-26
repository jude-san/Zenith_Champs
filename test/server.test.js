const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { createServer, ensureDatabaseFile } = require("../server");

const dbPath = path.join(__dirname, "..", "data", "db.json");

test("GET /api/state returns seeded payload", async () => {
  ensureDatabaseFile();
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/api/state`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.tasks[0].title, "Deploy cloud database");

  await new Promise((resolve) => server.close(resolve));
});

test("POST /api/comments appends comment", async () => {
  ensureDatabaseFile();
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  db.tasks[0].comments = [];
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/api/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Looks good" }),
  });
  assert.equal(response.status, 201);

  const stateResponse = await fetch(`http://127.0.0.1:${port}/api/state`);
  const body = await stateResponse.json();
  assert.equal(body.tasks[0].comments.length, 1);
  assert.equal(body.tasks[0].comments[0].text, "Looks good");

  await new Promise((resolve) => server.close(resolve));
});
