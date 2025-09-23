const { PrismaClient } = require("@prisma/client");

// Create a singleton instance of PrismaClient
class DatabaseService {
  constructor() {
    if (!DatabaseService.instance) {
      this.prisma = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "info", "warn", "error"]
            : ["error"],
        errorFormat: "pretty",
      });

      DatabaseService.instance = this;
    }

    return DatabaseService.instance;
  }

  // Get Prisma client instance
  getClient() {
    return this.prisma;
  }

  // Connect to database
  async connect() {
    try {
      await this.prisma.$connect();
      console.log("✅ Database connected successfully");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw error;
    }
  }

  // Disconnect from database
  async disconnect() {
    try {
      await this.prisma.$disconnect();
      console.log("✅ Database disconnected successfully");
    } catch (error) {
      console.error("❌ Database disconnection failed:", error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("❌ Database health check failed:", error);
      return false;
    }
  }
}

// Create and export a singleton instance
const databaseService = new DatabaseService();
module.exports = databaseService;
