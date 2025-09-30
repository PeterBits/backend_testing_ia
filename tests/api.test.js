const request = require("supertest");
const app = require("../src/server");
const databaseService = require("../src/services/database");

describe("API Health Check", () => {
  test("GET / should return API info", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("Gym Backend API is running");
    expect(response.body).toHaveProperty("version");
    expect(response.body).toHaveProperty("environment");
  });
});

// Clean up after all tests
afterAll(async () => {
  await databaseService.disconnect();
});
