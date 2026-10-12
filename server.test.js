
const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const app = require("./server");

let server;
let baseUrl;

test("Student API tests", async (t) => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  baseUrl = `http://127.0.0.1:${server.address().port}`;

  await t.test("GET returns student records", async () => {
    const response = await fetch(`${baseUrl}/api/students`);
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 2);
  });

  await t.test("POST adds a new student", async () => {
    const response = await fetch(`${baseUrl}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Student",
        rollNo: "TEST-501",
        course: "Computer Science"
      })
    });

    const data = await response.json();
    assert.equal(response.status, 201);
    assert.equal(data.name, "Test Student");
  });

  await t.test("POST rejects missing fields", async () => {
    const response = await fetch(`${baseUrl}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Incomplete Student" })
    });

    assert.equal(response.status, 400);
  });

  await t.test("DELETE removes a student", async () => {
    const created = await fetch(`${baseUrl}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Delete Test",
        rollNo: "TEST-502",
        course: "IT"
      })
    });

    const student = await created.json();

    const response = await fetch(
      `${baseUrl}/api/students/${student.id}`,
      { method: "DELETE" }
    );

    assert.equal(response.status, 200);
  });
});

after(() => {
  if (server) {
    server.closeAllConnections();
    server.close();
  }
});
