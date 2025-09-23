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

describe("Authentication Endpoints", () => {
  const testUser = {
    email: "test@example.com",
    password: "TestPassword123",
    name: "Test User",
  };

  afterEach(async () => {
    // Clean up test data
    const prisma = databaseService.getClient();
    try {
      await prisma.user.deleteMany({
        where: { email: testUser.email },
      });
    } catch (error) {
      // Ignore errors if user doesn't exist
    }
  });

  test("POST /api/auth/register should create a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("registered successfully");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.user).not.toHaveProperty("password");
  });

  test("POST /api/auth/register should reject duplicate email", async () => {
    // First registration
    await request(app).post("/api/auth/register").send(testUser);

    // Second registration with same email
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(response.status).toBe(409);
    expect(response.body.error).toContain("already exists");
  });

  test("POST /api/auth/login should authenticate user", async () => {
    // Register user first
    await request(app).post("/api/auth/register").send(testUser);

    // Login
    const response = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("Login successful");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe(testUser.email);
  });

  test("POST /api/auth/login should reject invalid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toContain("Invalid credentials");
  });

  test("GET /api/auth/profile should require authentication", async () => {
    const response = await request(app).get("/api/auth/profile");

    expect(response.status).toBe(401);
    expect(response.body.error).toContain("Access denied");
  });

  test("GET /api/auth/profile should return user data when authenticated", async () => {
    // Register and get token
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    const token = registerResponse.body.token;

    // Get profile
    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(testUser.email);
    expect(response.body.data).not.toHaveProperty("password");
  });
});

describe("Routine Endpoints", () => {
  let authToken;
  let userId;

  const testUser = {
    email: "routine-test@example.com",
    password: "TestPassword123",
    name: "Routine Test User",
  };

  const testRoutine = {
    title: "Test Routine",
    description: "A test workout routine",
    exercises: [
      {
        name: "Push-ups",
        sets: 3,
        reps: 10,
        rest: 60,
        order: 1,
      },
      {
        name: "Squats",
        sets: 3,
        reps: 15,
        rest: 90,
        order: 2,
      },
    ],
  };

  beforeEach(async () => {
    // Register user and get token
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    authToken = response.body.token;
    userId = response.body.user.id;
  });

  afterEach(async () => {
    // Clean up test data
    const prisma = databaseService.getClient();
    try {
      await prisma.user.deleteMany({
        where: { email: testUser.email },
      });
    } catch (error) {
      // Ignore errors
    }
  });

  test("GET /api/routines should require authentication", async () => {
    const response = await request(app).get("/api/routines");

    expect(response.status).toBe(401);
    expect(response.body.error).toContain("Access denied");
  });

  test("POST /api/routines should create a new routine", async () => {
    const response = await request(app)
      .post("/api/routines")
      .set("Authorization", `Bearer ${authToken}`)
      .send(testRoutine);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("created successfully");
    expect(response.body.data.title).toBe(testRoutine.title);
    expect(response.body.data.exercises).toHaveLength(2);
  });

  test("GET /api/routines should return user routines", async () => {
    // Create a routine first
    await request(app)
      .post("/api/routines")
      .set("Authorization", `Bearer ${authToken}`)
      .send(testRoutine);

    // Get routines
    const response = await request(app)
      .get("/api/routines")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe(testRoutine.title);
  });

  test("GET /api/routines/stats should return statistics", async () => {
    // Create a routine first
    await request(app)
      .post("/api/routines")
      .set("Authorization", `Bearer ${authToken}`)
      .send(testRoutine);

    // Get stats
    const response = await request(app)
      .get("/api/routines/stats")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalRoutines).toBe(1);
    expect(response.body.data.totalExercises).toBe(2);
  });
});

// Clean up after all tests
afterAll(async () => {
  await databaseService.disconnect();
});
