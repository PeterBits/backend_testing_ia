// Mock dependencies BEFORE imports
jest.mock("../../src/services/database");
jest.mock("express-validator", () => ({
  body: jest.fn(() => ({
    trim: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(),
}));

const { ExerciseController } = require("../../src/controllers/exercises");
const databaseService = require("../../src/services/database");
const { validationResult } = require("express-validator");

describe("ExerciseController", () => {
  let mockReq;
  let mockRes;
  let mockPrisma;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request and response
    mockReq = {
      body: {},
      params: {},
      userId: 1,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock Prisma client
    mockPrisma = {
      exercise: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    databaseService.getClient.mockReturnValue(mockPrisma);

    // Mock validationResult to return no errors by default
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
  });

  describe("getAllExercises", () => {
    it("should return all exercises successfully", async () => {
      const mockExercises = [
        {
          id: 1,
          name: "Bench Press",
          description: "Chest exercise",
          createdAt: new Date(),
        },
        {
          id: 2,
          name: "Squat",
          description: "Leg exercise",
          createdAt: new Date(),
        },
      ];

      mockPrisma.exercise.findMany.mockResolvedValue(mockExercises);

      await ExerciseController.getAllExercises(mockReq, mockRes);

      expect(mockPrisma.exercise.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockExercises,
        count: 2,
      });
    });

    it("should return empty array when no exercises exist", async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([]);

      await ExerciseController.getAllExercises(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0,
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockPrisma.exercise.findMany.mockRejectedValue(
        new Error("Database error")
      );

      await ExerciseController.getAllExercises(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve exercises",
        message: "An error occurred while fetching exercises.",
      });
    });
  });

  describe("getExerciseById", () => {
    it("should return exercise by id successfully", async () => {
      const mockExercise = {
        id: 1,
        name: "Bench Press",
        description: "Chest exercise",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReq.params.id = "1";
      mockPrisma.exercise.findUnique.mockResolvedValue(mockExercise);

      await ExerciseController.getExerciseById(mockReq, mockRes);

      expect(mockPrisma.exercise.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockExercise,
      });
    });

    it("should return 404 if exercise not found", async () => {
      mockReq.params.id = "999";
      mockPrisma.exercise.findUnique.mockResolvedValue(null);

      await ExerciseController.getExerciseById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Exercise not found",
        message: "The requested exercise does not exist.",
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.params.id = "1";
      mockPrisma.exercise.findUnique.mockRejectedValue(
        new Error("Database error")
      );

      await ExerciseController.getExerciseById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve exercise",
        message: "An error occurred while fetching the exercise.",
      });
    });
  });

  describe("createExercise", () => {
    const validExerciseData = {
      name: "Bench Press",
      description: "Chest exercise",
    };

    it("should create exercise successfully", async () => {
      mockReq.body = validExerciseData;

      mockPrisma.exercise.findFirst.mockResolvedValue(null);

      const mockExercise = {
        id: 1,
        name: validExerciseData.name,
        description: validExerciseData.description,
        createdAt: new Date(),
      };

      mockPrisma.exercise.create.mockResolvedValue(mockExercise);

      await ExerciseController.createExercise(mockReq, mockRes);

      expect(mockPrisma.exercise.findFirst).toHaveBeenCalledWith({
        where: {
          name: {
            equals: validExerciseData.name,
            mode: "insensitive",
          },
        },
      });
      expect(mockPrisma.exercise.create).toHaveBeenCalledWith({
        data: {
          name: validExerciseData.name,
          description: validExerciseData.description,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Exercise created successfully",
        data: mockExercise,
      });
    });

    it("should create exercise without description", async () => {
      mockReq.body = {
        name: "Squat",
      };

      mockPrisma.exercise.findFirst.mockResolvedValue(null);

      const mockExercise = {
        id: 1,
        name: "Squat",
        description: null,
        createdAt: new Date(),
      };

      mockPrisma.exercise.create.mockResolvedValue(mockExercise);

      await ExerciseController.createExercise(mockReq, mockRes);

      expect(mockPrisma.exercise.create).toHaveBeenCalledWith({
        data: {
          name: "Squat",
          description: null,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          {
            msg: "Exercise name must be between 1 and 100 characters",
            param: "name",
          },
        ],
      });

      await ExerciseController.createExercise(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Validation failed",
        message: "Please check your input data.",
        details: [
          {
            msg: "Exercise name must be between 1 and 100 characters",
            param: "name",
          },
        ],
      });
    });

    it("should return 409 if exercise already exists", async () => {
      mockReq.body = validExerciseData;

      mockPrisma.exercise.findFirst.mockResolvedValue({
        id: 1,
        name: validExerciseData.name,
      });

      await ExerciseController.createExercise(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Exercise already exists",
        message: "An exercise with this name already exists.",
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.body = validExerciseData;

      mockPrisma.exercise.findFirst.mockRejectedValue(
        new Error("Database error")
      );

      await ExerciseController.createExercise(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to create exercise",
        message: "An error occurred while creating the exercise.",
      });
    });
  });
});
