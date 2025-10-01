// Mock dependencies BEFORE imports
jest.mock("../../src/services/database");
jest.mock("express-validator", () => ({
  body: jest.fn(() => ({
    trim: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isArray: jest.fn().mockReturnThis(),
    custom: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(),
}));

const { RoutineController } = require("../../src/controllers/routines");
const databaseService = require("../../src/services/database");
const { validationResult } = require("express-validator");

describe("RoutineController", () => {
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
      user: { id: 1, role: "ATHLETE" },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock Prisma client
    mockPrisma = {
      routine: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      routineExercise: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      trainerAthlete: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    databaseService.getClient.mockReturnValue(mockPrisma);

    // Mock validationResult to return no errors by default
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
  });

  describe("getUserRoutines", () => {
    it("should return user routines successfully", async () => {
      const mockRoutines = [
        {
          id: 1,
          title: "Chest Day",
          description: "Chest workout",
          userId: 1,
          createdBy: 1,
          routineExercises: [
            {
              id: 1,
              exerciseId: 1,
              sets: 3,
              reps: 10,
              weight: 50,
              rest: 60,
              order: 1,
              exercise: { id: 1, name: "Bench Press", description: null },
            },
          ],
          creator: {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            role: "ATHLETE",
          },
          _count: { routineExercises: 1 },
          updatedAt: new Date(),
        },
      ];

      mockPrisma.routine.findMany.mockResolvedValue(mockRoutines);

      await RoutineController.getUserRoutines(mockReq, mockRes);

      expect(mockPrisma.routine.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          routineExercises: {
            orderBy: { order: "asc" },
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: { routineExercises: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRoutines,
        count: 1,
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockPrisma.routine.findMany.mockRejectedValue(
        new Error("Database error")
      );

      await RoutineController.getUserRoutines(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve routines",
        message: "An error occurred while fetching your routines.",
      });
    });
  });

  describe("getRoutineById", () => {
    it("should return routine by id successfully", async () => {
      const mockRoutine = {
        id: 1,
        title: "Chest Day",
        description: "Chest workout",
        userId: 1,
        createdBy: 1,
        routineExercises: [],
        user: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          role: "ATHLETE",
        },
        creator: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          role: "ATHLETE",
        },
      };

      mockReq.params.id = "1";
      mockPrisma.routine.findFirst.mockResolvedValue(mockRoutine);

      await RoutineController.getRoutineById(mockReq, mockRes);

      expect(mockPrisma.routine.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: 1,
        },
        include: expect.any(Object),
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRoutine,
      });
    });

    it("should return 404 if routine not found", async () => {
      mockReq.params.id = "999";
      mockPrisma.routine.findFirst.mockResolvedValue(null);

      await RoutineController.getRoutineById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Routine not found",
        message:
          "The requested routine does not exist or you do not have access to it.",
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.params.id = "1";
      mockPrisma.routine.findFirst.mockRejectedValue(
        new Error("Database error")
      );

      await RoutineController.getRoutineById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve routine",
        message: "An error occurred while fetching the routine.",
      });
    });
  });

  describe("createRoutine", () => {
    const validRoutineData = {
      title: "Chest Day",
      description: "Chest workout",
      exercises: [
        {
          exerciseId: 1,
          sets: 3,
          reps: 10,
          weight: 50,
          rest: 60,
          order: 1,
        },
      ],
    };

    it("should create routine successfully", async () => {
      mockReq.body = validRoutineData;

      const mockRoutine = {
        id: 1,
        title: validRoutineData.title,
        description: validRoutineData.description,
        userId: 1,
        createdBy: 1,
        routineExercises: [
          {
            id: 1,
            routineId: 1,
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: 50,
            rest: 60,
            order: 1,
            exercise: { id: 1, name: "Bench Press", description: null },
          },
        ],
      };

      mockPrisma.routine.create.mockResolvedValue({
        id: 1,
        title: validRoutineData.title,
        description: validRoutineData.description,
        userId: 1,
        createdBy: 1,
      });
      mockPrisma.routineExercise.createMany.mockResolvedValue({});
      mockPrisma.routine.findUnique.mockResolvedValue(mockRoutine);

      await RoutineController.createRoutine(mockReq, mockRes);

      expect(mockPrisma.routine.create).toHaveBeenCalledWith({
        data: {
          title: validRoutineData.title,
          description: validRoutineData.description,
          userId: 1,
          createdBy: 1,
        },
      });
      expect(mockPrisma.routineExercise.createMany).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Routine created successfully",
        data: mockRoutine,
      });
    });

    it("should create routine with exercises without weight and rest", async () => {
      mockReq.body = {
        title: "Bodyweight Workout",
        description: "No equipment needed",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 15,
            // weight and rest are undefined
          },
        ],
      };

      const mockRoutine = {
        id: 1,
        title: "Bodyweight Workout",
        description: "No equipment needed",
        userId: 1,
        createdBy: 1,
        routineExercises: [
          {
            id: 1,
            exerciseId: 1,
            sets: 3,
            reps: 15,
            weight: null,
            rest: null,
            order: 1,
            exercise: { id: 1, name: "Push-ups", description: null },
          },
        ],
      };

      mockPrisma.routine.create.mockResolvedValue({
        id: 1,
        title: "Bodyweight Workout",
        description: "No equipment needed",
        userId: 1,
        createdBy: 1,
      });
      mockPrisma.routineExercise.createMany.mockResolvedValue({});
      mockPrisma.routine.findUnique.mockResolvedValue(mockRoutine);

      await RoutineController.createRoutine(mockReq, mockRes);

      expect(mockPrisma.routineExercise.createMany).toHaveBeenCalledWith({
        data: [
          {
            routineId: 1,
            exerciseId: 1,
            sets: 3,
            reps: 15,
            weight: null,
            rest: null,
            order: 1,
          },
        ],
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should create routine with exercises using default order", async () => {
      mockReq.body = {
        title: "Multi-Exercise Routine",
        description: "Multiple exercises",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: 50,
            rest: 60,
            // order is undefined, should default to index + 1
          },
          {
            exerciseId: 2,
            sets: 4,
            reps: 8,
            weight: 70,
            rest: 90,
            // order is undefined, should default to index + 1
          },
        ],
      };

      const mockRoutine = {
        id: 1,
        title: "Multi-Exercise Routine",
        description: "Multiple exercises",
        userId: 1,
        createdBy: 1,
        routineExercises: [],
      };

      mockPrisma.routine.create.mockResolvedValue({
        id: 1,
        title: "Multi-Exercise Routine",
        description: "Multiple exercises",
        userId: 1,
        createdBy: 1,
      });
      mockPrisma.routineExercise.createMany.mockResolvedValue({});
      mockPrisma.routine.findUnique.mockResolvedValue(mockRoutine);

      await RoutineController.createRoutine(mockReq, mockRes);

      expect(mockPrisma.routineExercise.createMany).toHaveBeenCalledWith({
        data: [
          {
            routineId: 1,
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: 50,
            rest: 60,
            order: 1, // Default value from index 0 + 1
          },
          {
            routineId: 1,
            exerciseId: 2,
            sets: 4,
            reps: 8,
            weight: 70,
            rest: 90,
            order: 2, // Default value from index 1 + 1
          },
        ],
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should create routine without exercises", async () => {
      mockReq.body = {
        title: "Cardio Day",
        description: "Cardio workout",
      };

      const mockRoutine = {
        id: 1,
        title: "Cardio Day",
        description: "Cardio workout",
        userId: 1,
        createdBy: 1,
        routineExercises: [],
      };

      mockPrisma.routine.create.mockResolvedValue({
        id: 1,
        title: "Cardio Day",
        description: "Cardio workout",
        userId: 1,
        createdBy: 1,
      });
      mockPrisma.routine.findUnique.mockResolvedValue(mockRoutine);

      await RoutineController.createRoutine(mockReq, mockRes);

      expect(mockPrisma.routineExercise.createMany).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { msg: "Title must be between 1 and 100 characters", param: "title" },
        ],
      });

      await RoutineController.createRoutine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Validation failed",
        message: "Please check your input data.",
        details: [
          { msg: "Title must be between 1 and 100 characters", param: "title" },
        ],
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.body = validRoutineData;

      mockPrisma.routine.create.mockRejectedValue(new Error("Database error"));

      await RoutineController.createRoutine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to create routine",
        message: "An error occurred while creating the routine.",
      });
    });
  });

  describe("updateRoutine", () => {
    it("should update routine successfully", async () => {
      mockReq.params.id = "1";
      mockReq.body = {
        title: "Updated Title",
        description: "Updated description",
      };

      const existingRoutine = {
        id: 1,
        title: "Old Title",
        description: "Old description",
        userId: 1,
        createdBy: 1,
      };

      const updatedRoutine = {
        id: 1,
        title: "Updated Title",
        description: "Updated description",
        userId: 1,
        createdBy: 1,
        routineExercises: [],
      };

      mockPrisma.routine.findFirst.mockResolvedValue(existingRoutine);
      mockPrisma.routine.update.mockResolvedValue(updatedRoutine);
      mockPrisma.routine.findUnique.mockResolvedValue(updatedRoutine);

      await RoutineController.updateRoutine(mockReq, mockRes);

      expect(mockPrisma.routine.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          createdBy: 1,
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Routine updated successfully",
        data: updatedRoutine,
      });
    });

    it("should update only title when description is undefined", async () => {
      mockReq.params.id = "1";
      mockReq.body = {
        title: "Updated Title",
      };

      const existingRoutine = {
        id: 1,
        title: "Old Title",
        description: "Old description",
        userId: 1,
        createdBy: 1,
      };

      const updatedRoutine = {
        id: 1,
        title: "Updated Title",
        description: "Old description",
        userId: 1,
        createdBy: 1,
        routineExercises: [],
      };

      mockPrisma.routine.findFirst.mockResolvedValue(existingRoutine);
      mockPrisma.routine.update.mockResolvedValue(updatedRoutine);
      mockPrisma.routine.findUnique.mockResolvedValue(updatedRoutine);

      await RoutineController.updateRoutine(mockReq, mockRes);

      expect(mockPrisma.routine.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: "Updated Title",
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Routine updated successfully",
        data: updatedRoutine,
      });
    });

    it("should update only description when title is undefined", async () => {
      mockReq.params.id = "1";
      mockReq.body = {
        description: "Updated description",
      };

      const existingRoutine = {
        id: 1,
        title: "Old Title",
        description: "Old description",
        userId: 1,
        createdBy: 1,
      };

      const updatedRoutine = {
        id: 1,
        title: "Old Title",
        description: "Updated description",
        userId: 1,
        createdBy: 1,
        routineExercises: [],
      };

      mockPrisma.routine.findFirst.mockResolvedValue(existingRoutine);
      mockPrisma.routine.update.mockResolvedValue(updatedRoutine);
      mockPrisma.routine.findUnique.mockResolvedValue(updatedRoutine);

      await RoutineController.updateRoutine(mockReq, mockRes);

      expect(mockPrisma.routine.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          description: "Updated description",
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Routine updated successfully",
        data: updatedRoutine,
      });
    });

    it("should update routine without changing title or description when both are undefined", async () => {
      mockReq.params.id = "1";
      mockReq.body = {};

      const existingRoutine = {
        id: 1,
        title: "Old Title",
        description: "Old description",
        userId: 1,
        createdBy: 1,
      };

      const updatedRoutine = {
        id: 1,
        title: "Old Title",
        description: "Old description",
        userId: 1,
        createdBy: 1,
        routineExercises: [],
      };

      mockPrisma.routine.findFirst.mockResolvedValue(existingRoutine);
      mockPrisma.routine.update.mockResolvedValue(updatedRoutine);
      mockPrisma.routine.findUnique.mockResolvedValue(updatedRoutine);

      await RoutineController.updateRoutine(mockReq, mockRes);

      expect(mockPrisma.routine.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {},
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Routine updated successfully",
        data: updatedRoutine,
      });
    });

    it("should return 404 if routine not found or not creator", async () => {
      mockReq.params.id = "1";
      mockReq.body = { title: "Updated Title" };

      mockPrisma.routine.findFirst.mockResolvedValue(null);

      await RoutineController.updateRoutine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Routine not found",
        message:
          "The requested routine does not exist or you do not have permission to edit it.",
      });
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { msg: "Title must be between 1 and 100 characters", param: "title" },
        ],
      });

      await RoutineController.updateRoutine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should update routine with new exercises array", async () => {
      mockReq.params.id = "1";
      mockReq.body = {
        title: "Updated Title",
        exercises: [
          {
            exerciseId: 1,
            sets: 4,
            reps: 12,
            weight: 60,
            rest: 90,
            order: 1,
          },
        ],
      };

      const existingRoutine = {
        id: 1,
        title: "Old Title",
        userId: 1,
        createdBy: 1,
      };

      const updatedRoutine = {
        id: 1,
        title: "Updated Title",
        userId: 1,
        createdBy: 1,
        routineExercises: [
          {
            id: 1,
            exerciseId: 1,
            sets: 4,
            reps: 12,
            weight: 60,
            rest: 90,
            order: 1,
            exercise: { id: 1, name: "Bench Press", description: null },
          },
        ],
      };

      mockPrisma.routine.findFirst.mockResolvedValue(existingRoutine);
      mockPrisma.routine.update.mockResolvedValue({});
      mockPrisma.routineExercise.deleteMany.mockResolvedValue({});
      mockPrisma.routineExercise.createMany.mockResolvedValue({});
      mockPrisma.routine.findUnique.mockResolvedValue(updatedRoutine);

      await RoutineController.updateRoutine(mockReq, mockRes);

      expect(mockPrisma.routineExercise.deleteMany).toHaveBeenCalledWith({
        where: { routineId: 1 },
      });
      expect(mockPrisma.routineExercise.createMany).toHaveBeenCalledWith({
        data: [
          {
            routineId: 1,
            exerciseId: 1,
            sets: 4,
            reps: 12,
            weight: 60,
            rest: 90,
            order: 1,
          },
        ],
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Routine updated successfully",
        data: updatedRoutine,
      });
    });

    it("should update routine with exercises having weight/rest/order as 0", async () => {
      mockReq.params.id = "1";
      mockReq.body = {
        title: "Updated Title",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: 0, // 0 is falsy but valid
            rest: 0, // 0 is falsy but valid
            // order is undefined, will default to 1
          },
        ],
      };

      const existingRoutine = {
        id: 1,
        title: "Old Title",
        userId: 1,
        createdBy: 1,
      };

      const updatedRoutine = {
        id: 1,
        title: "Updated Title",
        userId: 1,
        createdBy: 1,
        routineExercises: [],
      };

      mockPrisma.routine.findFirst.mockResolvedValue(existingRoutine);
      mockPrisma.routine.update.mockResolvedValue({});
      mockPrisma.routineExercise.deleteMany.mockResolvedValue({});
      mockPrisma.routineExercise.createMany.mockResolvedValue({});
      mockPrisma.routine.findUnique.mockResolvedValue(updatedRoutine);

      await RoutineController.updateRoutine(mockReq, mockRes);

      expect(mockPrisma.routineExercise.createMany).toHaveBeenCalledWith({
        data: [
          {
            routineId: 1,
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: null, // 0 is falsy, so || null converts it to null
            rest: null, // 0 is falsy, so || null converts it to null
            order: 1, // Should default to index + 1
          },
        ],
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Routine updated successfully",
        data: updatedRoutine,
      });
    });

    it("should update routine and remove all exercises when empty array provided", async () => {
      mockReq.params.id = "1";
      mockReq.body = {
        title: "Updated Title",
        exercises: [],
      };

      const existingRoutine = {
        id: 1,
        title: "Old Title",
        userId: 1,
        createdBy: 1,
      };

      const updatedRoutine = {
        id: 1,
        title: "Updated Title",
        userId: 1,
        createdBy: 1,
        routineExercises: [],
      };

      mockPrisma.routine.findFirst.mockResolvedValue(existingRoutine);
      mockPrisma.routine.update.mockResolvedValue({});
      mockPrisma.routineExercise.deleteMany.mockResolvedValue({});
      mockPrisma.routine.findUnique.mockResolvedValue(updatedRoutine);

      await RoutineController.updateRoutine(mockReq, mockRes);

      expect(mockPrisma.routineExercise.deleteMany).toHaveBeenCalledWith({
        where: { routineId: 1 },
      });
      expect(mockPrisma.routineExercise.createMany).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Routine updated successfully",
        data: updatedRoutine,
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.params.id = "1";
      mockReq.body = { title: "Updated Title" };

      mockPrisma.routine.findFirst.mockRejectedValue(
        new Error("Database error")
      );

      await RoutineController.updateRoutine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to update routine",
        message: "An error occurred while updating the routine.",
      });
    });
  });

  describe("deleteRoutine", () => {
    it("should delete routine successfully", async () => {
      mockReq.params.id = "1";

      const existingRoutine = {
        id: 1,
        title: "Test Routine",
        userId: 1,
        createdBy: 1,
      };

      mockPrisma.routine.findFirst.mockResolvedValue(existingRoutine);
      mockPrisma.routine.delete.mockResolvedValue({});

      await RoutineController.deleteRoutine(mockReq, mockRes);

      expect(mockPrisma.routine.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          createdBy: 1,
        },
      });
      expect(mockPrisma.routine.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Routine deleted successfully",
      });
    });

    it("should return 404 if routine not found or not creator", async () => {
      mockReq.params.id = "1";

      mockPrisma.routine.findFirst.mockResolvedValue(null);

      await RoutineController.deleteRoutine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Routine not found",
        message:
          "The requested routine does not exist or you do not have permission to delete it.",
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.params.id = "1";

      mockPrisma.routine.findFirst.mockRejectedValue(
        new Error("Database error")
      );

      await RoutineController.deleteRoutine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to delete routine",
        message: "An error occurred while deleting the routine.",
      });
    });
  });

  describe("assignRoutineToAthlete", () => {
    const validAssignData = {
      athleteId: 2,
      title: "Assigned Routine",
      description: "Routine for athlete",
      exercises: [],
    };

    it("should assign routine to athlete successfully", async () => {
      mockReq.body = validAssignData;
      mockReq.user.role = "TRAINER";

      mockPrisma.trainerAthlete.findFirst.mockResolvedValue({
        id: 1,
        trainerId: 1,
        athleteId: 2,
      });

      const mockRoutine = {
        id: 1,
        title: validAssignData.title,
        description: validAssignData.description,
        userId: 2,
        createdBy: 1,
        routineExercises: [],
        user: { id: 2, name: "Athlete", email: "athlete@example.com" },
      };

      mockPrisma.routine.create.mockResolvedValue({
        id: 1,
        title: validAssignData.title,
        description: validAssignData.description,
        userId: 2,
        createdBy: 1,
      });
      mockPrisma.routine.findUnique.mockResolvedValue(mockRoutine);

      await RoutineController.assignRoutineToAthlete(mockReq, mockRes);

      expect(mockPrisma.trainerAthlete.findFirst).toHaveBeenCalledWith({
        where: {
          trainerId: 1,
          athleteId: 2,
        },
      });
      expect(mockPrisma.routine.create).toHaveBeenCalledWith({
        data: {
          title: validAssignData.title,
          description: validAssignData.description,
          userId: 2,
          createdBy: 1,
        },
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Routine assigned to athlete successfully",
        data: mockRoutine,
      });
    });

    it("should assign routine to athlete with exercises", async () => {
      mockReq.body = {
        athleteId: 2,
        title: "Assigned Routine",
        description: "Routine for athlete",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: 50,
            rest: 60,
            order: 1,
          },
        ],
      };
      mockReq.user.role = "TRAINER";

      mockPrisma.trainerAthlete.findFirst.mockResolvedValue({
        id: 1,
        trainerId: 1,
        athleteId: 2,
      });

      const mockRoutine = {
        id: 1,
        title: "Assigned Routine",
        description: "Routine for athlete",
        userId: 2,
        createdBy: 1,
        routineExercises: [
          {
            id: 1,
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: 50,
            rest: 60,
            order: 1,
            exercise: { id: 1, name: "Bench Press", description: null },
          },
        ],
        user: { id: 2, name: "Athlete", email: "athlete@example.com" },
      };

      mockPrisma.routine.create.mockResolvedValue({
        id: 1,
        title: "Assigned Routine",
        description: "Routine for athlete",
        userId: 2,
        createdBy: 1,
      });
      mockPrisma.routineExercise.createMany.mockResolvedValue({});
      mockPrisma.routine.findUnique.mockResolvedValue(mockRoutine);

      await RoutineController.assignRoutineToAthlete(mockReq, mockRes);

      expect(mockPrisma.routineExercise.createMany).toHaveBeenCalledWith({
        data: [
          {
            routineId: 1,
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: 50,
            rest: 60,
            order: 1,
          },
        ],
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Routine assigned to athlete successfully",
        data: mockRoutine,
      });
    });

    it("should assign routine with exercises without weight and rest", async () => {
      mockReq.body = {
        athleteId: 2,
        title: "Bodyweight Routine",
        description: "No equipment",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 15,
            // weight and rest are undefined
          },
        ],
      };
      mockReq.user.role = "TRAINER";

      mockPrisma.trainerAthlete.findFirst.mockResolvedValue({
        id: 1,
        trainerId: 1,
        athleteId: 2,
      });

      const mockRoutine = {
        id: 1,
        title: "Bodyweight Routine",
        description: "No equipment",
        userId: 2,
        createdBy: 1,
        routineExercises: [],
        user: { id: 2, name: "Athlete", email: "athlete@example.com" },
      };

      mockPrisma.routine.create.mockResolvedValue({
        id: 1,
        title: "Bodyweight Routine",
        description: "No equipment",
        userId: 2,
        createdBy: 1,
      });
      mockPrisma.routineExercise.createMany.mockResolvedValue({});
      mockPrisma.routine.findUnique.mockResolvedValue(mockRoutine);

      await RoutineController.assignRoutineToAthlete(mockReq, mockRes);

      expect(mockPrisma.routineExercise.createMany).toHaveBeenCalledWith({
        data: [
          {
            routineId: 1,
            exerciseId: 1,
            sets: 3,
            reps: 15,
            weight: null,
            rest: null,
            order: 1,
          },
        ],
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should assign routine with exercises using default order", async () => {
      mockReq.body = {
        athleteId: 2,
        title: "Multi-Exercise Routine",
        description: "Multiple exercises",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            // order is undefined
          },
          {
            exerciseId: 2,
            sets: 4,
            reps: 8,
            // order is undefined
          },
        ],
      };
      mockReq.user.role = "TRAINER";

      mockPrisma.trainerAthlete.findFirst.mockResolvedValue({
        id: 1,
        trainerId: 1,
        athleteId: 2,
      });

      const mockRoutine = {
        id: 1,
        title: "Multi-Exercise Routine",
        description: "Multiple exercises",
        userId: 2,
        createdBy: 1,
        routineExercises: [],
        user: { id: 2, name: "Athlete", email: "athlete@example.com" },
      };

      mockPrisma.routine.create.mockResolvedValue({
        id: 1,
        title: "Multi-Exercise Routine",
        description: "Multiple exercises",
        userId: 2,
        createdBy: 1,
      });
      mockPrisma.routineExercise.createMany.mockResolvedValue({});
      mockPrisma.routine.findUnique.mockResolvedValue(mockRoutine);

      await RoutineController.assignRoutineToAthlete(mockReq, mockRes);

      expect(mockPrisma.routineExercise.createMany).toHaveBeenCalledWith({
        data: [
          {
            routineId: 1,
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: null,
            rest: null,
            order: 1,
          },
          {
            routineId: 1,
            exerciseId: 2,
            sets: 4,
            reps: 8,
            weight: null,
            rest: null,
            order: 2,
          },
        ],
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should assign routine without exercises when undefined", async () => {
      mockReq.body = {
        athleteId: 2,
        title: "Assigned Routine",
        description: "Routine for athlete",
        // exercises is undefined, should default to []
      };
      mockReq.user.role = "TRAINER";

      mockPrisma.trainerAthlete.findFirst.mockResolvedValue({
        id: 1,
        trainerId: 1,
        athleteId: 2,
      });

      const mockRoutine = {
        id: 1,
        title: "Assigned Routine",
        description: "Routine for athlete",
        userId: 2,
        createdBy: 1,
        routineExercises: [],
        user: { id: 2, name: "Athlete", email: "athlete@example.com" },
      };

      mockPrisma.routine.create.mockResolvedValue({
        id: 1,
        title: "Assigned Routine",
        description: "Routine for athlete",
        userId: 2,
        createdBy: 1,
      });
      mockPrisma.routine.findUnique.mockResolvedValue(mockRoutine);

      await RoutineController.assignRoutineToAthlete(mockReq, mockRes);

      expect(mockPrisma.routineExercise.createMany).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should return 403 if trainer-athlete relationship does not exist", async () => {
      mockReq.body = validAssignData;

      mockPrisma.trainerAthlete.findFirst.mockResolvedValue(null);

      await RoutineController.assignRoutineToAthlete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Permission denied",
        message: "You can only assign routines to your athletes.",
      });
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { msg: "Valid athlete ID is required", param: "athleteId" },
        ],
      });

      await RoutineController.assignRoutineToAthlete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.body = validAssignData;

      mockPrisma.trainerAthlete.findFirst.mockRejectedValue(
        new Error("Database error")
      );

      await RoutineController.assignRoutineToAthlete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to assign routine",
        message: "An error occurred while assigning the routine.",
      });
    });
  });

  describe("getTrainerAthletes", () => {
    it("should return trainer's athletes successfully", async () => {
      mockReq.user.role = "TRAINER";

      const mockRelationships = [
        {
          id: 1,
          trainerId: 1,
          athleteId: 2,
          createdAt: new Date(),
          athlete: {
            id: 2,
            name: "Athlete 1",
            email: "athlete1@example.com",
            createdAt: new Date(),
            _count: { routines: 5 },
          },
        },
      ];

      mockPrisma.trainerAthlete.findMany.mockResolvedValue(mockRelationships);

      await RoutineController.getTrainerAthletes(mockReq, mockRes);

      expect(mockPrisma.trainerAthlete.findMany).toHaveBeenCalledWith({
        where: { trainerId: 1 },
        include: expect.any(Object),
        orderBy: { createdAt: "desc" },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 2,
            name: "Athlete 1",
            relationshipSince: expect.any(Date),
          }),
        ]),
        count: 1,
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockPrisma.trainerAthlete.findMany.mockRejectedValue(
        new Error("Database error")
      );

      await RoutineController.getTrainerAthletes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve athletes",
        message: "An error occurred while fetching your athletes.",
      });
    });
  });

  describe("getAthleteTrainers", () => {
    it("should return athlete's trainers successfully", async () => {
      const mockRelationships = [
        {
          id: 1,
          trainerId: 2,
          athleteId: 1,
          createdAt: new Date(),
          trainer: {
            id: 2,
            name: "Trainer 1",
            email: "trainer1@example.com",
            createdAt: new Date(),
          },
        },
      ];

      mockPrisma.trainerAthlete.findMany.mockResolvedValue(mockRelationships);

      await RoutineController.getAthleteTrainers(mockReq, mockRes);

      expect(mockPrisma.trainerAthlete.findMany).toHaveBeenCalledWith({
        where: { athleteId: 1 },
        include: expect.any(Object),
        orderBy: { createdAt: "desc" },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 2,
            name: "Trainer 1",
            relationshipSince: expect.any(Date),
          }),
        ]),
        count: 1,
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockPrisma.trainerAthlete.findMany.mockRejectedValue(
        new Error("Database error")
      );

      await RoutineController.getAthleteTrainers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve trainers",
        message: "An error occurred while fetching your trainers.",
      });
    });
  });

  describe("addAthlete", () => {
    it("should add athlete to trainer successfully", async () => {
      mockReq.body = { athleteId: 2 };
      mockReq.user.role = "TRAINER";

      const mockAthlete = {
        id: 2,
        name: "Athlete",
        email: "athlete@example.com",
        role: "ATHLETE",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockAthlete);
      mockPrisma.trainerAthlete.findFirst.mockResolvedValue(null);
      mockPrisma.trainerAthlete.create.mockResolvedValue({
        id: 1,
        trainerId: 1,
        athleteId: 2,
        athlete: mockAthlete,
      });

      await RoutineController.addAthlete(mockReq, mockRes);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(mockPrisma.trainerAthlete.create).toHaveBeenCalledWith({
        data: {
          trainerId: 1,
          athleteId: 2,
        },
        include: expect.any(Object),
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Athlete added successfully",
        data: expect.any(Object),
      });
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { msg: "Valid athlete ID is required", param: "athleteId" },
        ],
      });

      await RoutineController.addAthlete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Validation failed",
        message: "Please check your input data.",
        details: [{ msg: "Valid athlete ID is required", param: "athleteId" }],
      });
    });

    it("should return 404 if athlete does not exist", async () => {
      mockReq.body = { athleteId: 999 };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await RoutineController.addAthlete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Athlete not found",
        message: "The specified athlete does not exist.",
      });
    });

    it("should return 400 if user is not an athlete", async () => {
      mockReq.body = { athleteId: 2 };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 2,
        role: "TRAINER",
      });

      await RoutineController.addAthlete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid user type",
        message: "The specified user is not an athlete.",
      });
    });

    it("should return 409 if relationship already exists", async () => {
      mockReq.body = { athleteId: 2 };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 2,
        role: "ATHLETE",
      });
      mockPrisma.trainerAthlete.findFirst.mockResolvedValue({
        id: 1,
        trainerId: 1,
        athleteId: 2,
      });

      await RoutineController.addAthlete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Relationship exists",
        message: "This athlete is already assigned to you.",
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.body = { athleteId: 2 };

      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      await RoutineController.addAthlete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to add athlete",
        message: "An error occurred while adding the athlete.",
      });
    });
  });

  describe("removeAthlete", () => {
    it("should remove athlete from trainer successfully", async () => {
      mockReq.params.athleteId = "2";
      mockReq.user.role = "TRAINER";

      mockPrisma.trainerAthlete.findFirst.mockResolvedValue({
        id: 1,
        trainerId: 1,
        athleteId: 2,
      });
      mockPrisma.trainerAthlete.delete.mockResolvedValue({});

      await RoutineController.removeAthlete(mockReq, mockRes);

      expect(mockPrisma.trainerAthlete.findFirst).toHaveBeenCalledWith({
        where: {
          trainerId: 1,
          athleteId: 2,
        },
      });
      expect(mockPrisma.trainerAthlete.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Athlete removed successfully",
      });
    });

    it("should return 404 if relationship not found", async () => {
      mockReq.params.athleteId = "2";

      mockPrisma.trainerAthlete.findFirst.mockResolvedValue(null);

      await RoutineController.removeAthlete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Relationship not found",
        message: "This athlete is not assigned to you.",
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.params.athleteId = "2";

      mockPrisma.trainerAthlete.findFirst.mockRejectedValue(
        new Error("Database error")
      );

      await RoutineController.removeAthlete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to remove athlete",
        message: "An error occurred while removing the athlete.",
      });
    });
  });

  describe("getRoutineStats", () => {
    it("should return routine statistics successfully", async () => {
      const mockStats = {
        _count: {
          routines: 5,
        },
        routines: [
          {
            _count: { routineExercises: 3 },
            createdAt: new Date(),
          },
          {
            _count: { routineExercises: 5 },
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          },
          {
            _count: { routineExercises: 2 },
            createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
          },
        ],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockStats);

      await RoutineController.getRoutineStats(mockReq, mockRes);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.any(Object),
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalRoutines: 5,
          totalExercises: 10,
          recentRoutines: 2,
          averageExercisesPerRoutine: 2,
        },
      });
    });

    it("should return statistics with 0 routines", async () => {
      const mockStats = {
        _count: {
          routines: 0,
        },
        routines: [],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockStats);

      await RoutineController.getRoutineStats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalRoutines: 0,
          totalExercises: 0,
          recentRoutines: 0,
          averageExercisesPerRoutine: 0, // Should be 0 when no routines
        },
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      await RoutineController.getRoutineStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve statistics",
        message: "An error occurred while fetching your statistics.",
      });
    });
  });
});
