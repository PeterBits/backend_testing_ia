// Mock dependencies BEFORE imports
jest.mock("../../src/services/database");
jest.mock("express-validator", () => ({
  body: jest.fn(() => ({
    optional: jest.fn().mockReturnThis(),
    isFloat: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(),
}));

const { MetricsController } = require("../../src/controllers/metrics");
const databaseService = require("../../src/services/database");
const { validationResult } = require("express-validator");

describe("MetricsController", () => {
  let mockReq;
  let mockRes;
  let mockPrisma;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request and response
    mockReq = {
      body: {},
      userId: 1,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock Prisma client
    mockPrisma = {
      userMetrics: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
    };

    databaseService.getClient.mockReturnValue(mockPrisma);

    // Mock validationResult to return no errors by default
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
  });

  describe("getUserMetrics", () => {
    it("should return user metrics successfully", async () => {
      const mockMetrics = {
        id: 1,
        height: 180,
        weight: 75,
        age: 25,
        gender: "male",
        bodyFat: 15,
        muscleMass: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.userMetrics.findUnique.mockResolvedValue(mockMetrics);

      await MetricsController.getUserMetrics(mockReq, mockRes);

      expect(mockPrisma.userMetrics.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        select: {
          id: true,
          height: true,
          weight: true,
          age: true,
          gender: true,
          bodyFat: true,
          muscleMass: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetrics,
      });
    });

    it("should return null if metrics do not exist", async () => {
      mockPrisma.userMetrics.findUnique.mockResolvedValue(null);

      await MetricsController.getUserMetrics(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockPrisma.userMetrics.findUnique.mockRejectedValue(
        new Error("Database error")
      );

      await MetricsController.getUserMetrics(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve metrics",
        message: "An error occurred while fetching your metrics.",
      });
    });
  });

  describe("upsertUserMetrics", () => {
    const validMetricsData = {
      height: 180,
      weight: 75,
      age: 25,
      gender: "male",
      bodyFat: 15,
      muscleMass: 40,
    };

    it("should create metrics successfully", async () => {
      mockReq.body = validMetricsData;

      const mockMetrics = {
        id: 1,
        ...validMetricsData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.userMetrics.upsert.mockResolvedValue(mockMetrics);

      await MetricsController.upsertUserMetrics(mockReq, mockRes);

      expect(mockPrisma.userMetrics.upsert).toHaveBeenCalledWith({
        where: { userId: 1 },
        update: {
          height: 180,
          weight: 75,
          age: 25,
          gender: "male",
          bodyFat: 15,
          muscleMass: 40,
        },
        create: {
          userId: 1,
          height: 180,
          weight: 75,
          age: 25,
          gender: "male",
          bodyFat: 15,
          muscleMass: 40,
        },
        select: {
          id: true,
          height: true,
          weight: true,
          age: true,
          gender: true,
          bodyFat: true,
          muscleMass: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Metrics updated successfully",
        data: mockMetrics,
      });
    });

    it("should update partial metrics successfully", async () => {
      mockReq.body = {
        weight: 80,
        bodyFat: 14,
      };

      const mockMetrics = {
        id: 1,
        height: 180,
        weight: 80,
        age: 25,
        gender: "male",
        bodyFat: 14,
        muscleMass: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.userMetrics.upsert.mockResolvedValue(mockMetrics);

      await MetricsController.upsertUserMetrics(mockReq, mockRes);

      expect(mockPrisma.userMetrics.upsert).toHaveBeenCalledWith({
        where: { userId: 1 },
        update: {
          weight: 80,
          bodyFat: 14,
        },
        create: {
          userId: 1,
          height: null,
          weight: 80,
          age: null,
          gender: null,
          bodyFat: 14,
          muscleMass: null,
        },
        select: {
          id: true,
          height: true,
          weight: true,
          age: true,
          gender: true,
          bodyFat: true,
          muscleMass: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Metrics updated successfully",
        data: mockMetrics,
      });
    });

    it("should handle all gender values", async () => {
      const genders = ["male", "female", "other", "prefer_not_to_say"];

      for (const gender of genders) {
        mockReq.body = { gender };

        const mockMetrics = {
          id: 1,
          height: null,
          weight: null,
          age: null,
          gender,
          bodyFat: null,
          muscleMass: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrisma.userMetrics.upsert.mockResolvedValue(mockMetrics);

        await MetricsController.upsertUserMetrics(mockReq, mockRes);

        expect(mockPrisma.userMetrics.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            update: { gender },
            create: expect.objectContaining({ gender }),
          })
        );
      }
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { msg: "Height must be between 50 and 300 cm", param: "height" },
        ],
      });

      await MetricsController.upsertUserMetrics(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Validation failed",
        message: "Please check your input data.",
        details: [
          { msg: "Height must be between 50 and 300 cm", param: "height" },
        ],
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.body = validMetricsData;

      mockPrisma.userMetrics.upsert.mockRejectedValue(
        new Error("Database error")
      );

      await MetricsController.upsertUserMetrics(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to update metrics",
        message: "An error occurred while updating your metrics.",
      });
    });
  });

  describe("deleteUserMetrics", () => {
    it("should delete metrics successfully", async () => {
      const mockMetrics = {
        id: 1,
        userId: 1,
        height: 180,
        weight: 75,
        age: 25,
        gender: "male",
        bodyFat: 15,
        muscleMass: 40,
      };

      mockPrisma.userMetrics.findUnique.mockResolvedValue(mockMetrics);
      mockPrisma.userMetrics.delete.mockResolvedValue({});

      await MetricsController.deleteUserMetrics(mockReq, mockRes);

      expect(mockPrisma.userMetrics.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(mockPrisma.userMetrics.delete).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Metrics deleted successfully",
      });
    });

    it("should return 404 if metrics do not exist", async () => {
      mockPrisma.userMetrics.findUnique.mockResolvedValue(null);

      await MetricsController.deleteUserMetrics(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Metrics not found",
        message: "You don't have any metrics to delete.",
      });
      expect(mockPrisma.userMetrics.delete).not.toHaveBeenCalled();
    });

    it("should return 500 if database error occurs", async () => {
      mockPrisma.userMetrics.findUnique.mockRejectedValue(
        new Error("Database error")
      );

      await MetricsController.deleteUserMetrics(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to delete metrics",
        message: "An error occurred while deleting your metrics.",
      });
    });
  });
});
