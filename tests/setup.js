// Test setup file
const databaseService = require("../src/services/database");

// Set test environment
process.env.NODE_ENV = "test";

// Set up test database connection
beforeAll(async () => {
  try {
    await databaseService.connect();
  } catch (error) {
    console.error("Failed to connect to test database:", error);
  }
});

// Increase test timeout for database operations
jest.setTimeout(30000);
