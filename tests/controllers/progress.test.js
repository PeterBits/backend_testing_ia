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
    isISO8601: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(),
}));

const ProgressController = require("../../src/controllers/progress");
const databaseService = require("../../src/services/database");
const { validationResult } = require("express-validator");

describe("ProgressController", () => {
  let mockReq;
  let mockRes;
  let mockPrisma;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
      query: {},
      userId: 1,
      user: { id: 1, role: "ATHLETE" },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockPrisma = {
      workoutSession: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
      },
      sessionExercise: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
        groupBy: jest.fn(),
      },
      routine: {
        findFirst: jest.fn(),
      },
      exercise: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    databaseService.getClient.mockReturnValue(mockPrisma);

    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
  });

  describe("createSession", () => {
    it("should create a workout session successfully", async () => {
      const mockSession = {
        id: 1,
        userId: 1,
        routineId: null,
        title: "Morning Workout",
        notes: "Felt great!",
        startedAt: new Date(),
        completedAt: null,
        duration: null,
        sessionExercises: [],
        routine: null,
      };

      mockReq.body = {
        title: "Morning Workout",
        notes: "Felt great!",
      };

      mockPrisma.workoutSession.create.mockResolvedValue(mockSession);
      mockPrisma.workoutSession.findUnique.mockResolvedValue(mockSession);

      await ProgressController.createSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockSession,
      });
    });

    it("should create a workout session with exercises", async () => {
      const mockExercises = [{ id: 1 }, { id: 2 }];

      const mockSession = {
        id: 1,
        userId: 1,
        routineId: null,
        title: "Leg Day",
        notes: null,
        startedAt: new Date(),
        completedAt: new Date(),
        duration: 3600,
        sessionExercises: [
          {
            id: 1,
            sessionId: 1,
            exerciseId: 1,
            sets: 4,
            reps: 10,
            weight: 100,
            rest: 90,
            order: 1,
            notes: "PR!",
            exercise: { id: 1, name: "Squat", description: null },
          },
          {
            id: 2,
            sessionId: 1,
            exerciseId: 2,
            sets: 3,
            reps: 12,
            weight: 60,
            rest: 60,
            order: 2,
            notes: null,
            exercise: { id: 2, name: "Leg Press", description: null },
          },
        ],
        routine: null,
      };

      mockReq.body = {
        title: "Leg Day",
        completedAt: new Date().toISOString(),
        duration: 3600,
        exercises: [
          {
            exerciseId: 1,
            sets: 4,
            reps: 10,
            weight: 100,
            rest: 90,
            order: 1,
            notes: "PR!",
          },
          { exerciseId: 2, sets: 3, reps: 12, weight: 60, rest: 60, order: 2 },
        ],
      };

      mockPrisma.exercise.findMany.mockResolvedValue(mockExercises);
      mockPrisma.workoutSession.create.mockResolvedValue(mockSession);
      mockPrisma.workoutSession.findUnique.mockResolvedValue(mockSession);

      await ProgressController.createSession(mockReq, mockRes);

      expect(mockPrisma.exercise.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
        select: { id: true },
      });
      expect(mockPrisma.sessionExercise.createMany).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockSession,
      });
    });

    it("should return 404 if routine not found", async () => {
      mockReq.body = {
        routineId: 999,
        title: "Test Workout",
      };

      mockPrisma.routine.findFirst.mockResolvedValue(null);

      await ProgressController.createSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Routine not found or access denied",
      });
    });

    it("should return 400 if exercises not found", async () => {
      mockReq.body = {
        title: "Test Workout",
        exercises: [
          { exerciseId: 1, sets: 3, reps: 10 },
          { exerciseId: 2, sets: 3, reps: 10 },
        ],
      };

      mockPrisma.exercise.findMany.mockResolvedValue([{ id: 1 }]);

      await ProgressController.createSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "One or more exercises not found",
      });
    });

    it("should return 400 on validation errors", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Title is required" }],
      });

      await ProgressController.createSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: "Title is required" }],
      });
    });
  });

  describe("getUserSessions", () => {
    it("should return user sessions successfully", async () => {
      const mockSessions = [
        {
          id: 1,
          userId: 1,
          routineId: null,
          title: "Morning Workout",
          notes: null,
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 3600,
          sessionExercises: [],
          routine: null,
        },
      ];

      mockPrisma.workoutSession.findMany.mockResolvedValue(mockSessions);

      await ProgressController.getUserSessions(mockReq, mockRes);

      expect(mockPrisma.workoutSession.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: expect.any(Object),
        orderBy: { startedAt: "desc" },
        take: undefined,
        skip: undefined,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessions,
        count: mockSessions.length,
      });
    });

    it("should filter sessions by routineId", async () => {
      mockReq.query = { routineId: "5" };

      mockPrisma.workoutSession.findMany.mockResolvedValue([]);

      await ProgressController.getUserSessions(mockReq, mockRes);

      expect(mockPrisma.workoutSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1, routineId: 5 },
        })
      );
    });

    it("should filter sessions by completion status", async () => {
      mockReq.query = { completed: "true" };

      mockPrisma.workoutSession.findMany.mockResolvedValue([]);

      await ProgressController.getUserSessions(mockReq, mockRes);

      expect(mockPrisma.workoutSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1, completedAt: { not: null } },
        })
      );
    });

    it("should filter sessions by date range", async () => {
      mockReq.query = {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      };

      mockPrisma.workoutSession.findMany.mockResolvedValue([]);

      await ProgressController.getUserSessions(mockReq, mockRes);

      expect(mockPrisma.workoutSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 1,
            startedAt: {
              gte: new Date("2024-01-01"),
              lte: new Date("2024-12-31"),
            },
          },
        })
      );
    });

    it("should apply limit and offset", async () => {
      mockReq.query = { limit: "10", offset: "5" };

      mockPrisma.workoutSession.findMany.mockResolvedValue([]);

      await ProgressController.getUserSessions(mockReq, mockRes);

      expect(mockPrisma.workoutSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 5,
        })
      );
    });
  });

  describe("getSessionById", () => {
    it("should return session by id successfully", async () => {
      const mockSession = {
        id: 1,
        userId: 1,
        routineId: null,
        title: "Test Session",
        notes: null,
        startedAt: new Date(),
        completedAt: null,
        duration: null,
        sessionExercises: [],
        routine: null,
      };

      mockReq.params.id = "1";
      mockPrisma.workoutSession.findFirst.mockResolvedValue(mockSession);

      await ProgressController.getSessionById(mockReq, mockRes);

      expect(mockPrisma.workoutSession.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        include: expect.any(Object),
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockSession,
      });
    });

    it("should return 404 if session not found", async () => {
      mockReq.params.id = "999";
      mockPrisma.workoutSession.findFirst.mockResolvedValue(null);

      await ProgressController.getSessionById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Session not found",
      });
    });
  });

  describe("updateSession", () => {
    it("should update session successfully", async () => {
      const existingSession = {
        id: 1,
        userId: 1,
        title: "Old Title",
      };

      const updatedSession = {
        id: 1,
        userId: 1,
        routineId: null,
        title: "New Title",
        notes: "Updated notes",
        startedAt: new Date(),
        completedAt: new Date(),
        duration: 4000,
        sessionExercises: [],
        routine: null,
      };

      mockReq.params.id = "1";
      mockReq.body = {
        title: "New Title",
        notes: "Updated notes",
        completedAt: new Date().toISOString(),
        duration: 4000,
      };

      mockPrisma.workoutSession.findFirst.mockResolvedValue(existingSession);
      mockPrisma.workoutSession.update.mockResolvedValue(updatedSession);
      mockPrisma.workoutSession.findUnique.mockResolvedValue(updatedSession);

      await ProgressController.updateSession(mockReq, mockRes);

      expect(mockPrisma.workoutSession.update).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedSession,
      });
    });

    it("should update session with exercises", async () => {
      const existingSession = { id: 1, userId: 1 };
      const updatedSession = {
        id: 1,
        userId: 1,
        title: "Updated Workout",
        sessionExercises: [
          {
            exerciseId: 1,
            sets: 5,
            reps: 5,
            weight: 120,
            exercise: { id: 1, name: "Squat" },
          },
        ],
      };

      mockReq.params.id = "1";
      mockReq.body = {
        exercises: [{ exerciseId: 1, sets: 5, reps: 5, weight: 120 }],
      };

      mockPrisma.workoutSession.findFirst.mockResolvedValue(existingSession);
      mockPrisma.exercise.findMany.mockResolvedValue([{ id: 1 }]);
      mockPrisma.workoutSession.findUnique.mockResolvedValue(updatedSession);

      await ProgressController.updateSession(mockReq, mockRes);

      expect(mockPrisma.sessionExercise.deleteMany).toHaveBeenCalledWith({
        where: { sessionId: 1 },
      });
      expect(mockPrisma.sessionExercise.createMany).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedSession,
      });
    });

    it("should return 404 if session not found", async () => {
      mockReq.params.id = "999";
      mockReq.body = { title: "New Title" };

      mockPrisma.workoutSession.findFirst.mockResolvedValue(null);

      await ProgressController.updateSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Session not found",
      });
    });

    it("should return 400 on validation errors", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Invalid title" }],
      });

      mockReq.params.id = "1";

      await ProgressController.updateSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: "Invalid title" }],
      });
    });
  });

  describe("deleteSession", () => {
    it("should delete session successfully", async () => {
      const mockSession = { id: 1, userId: 1, title: "Test Session" };

      mockReq.params.id = "1";
      mockPrisma.workoutSession.findFirst.mockResolvedValue(mockSession);
      mockPrisma.workoutSession.delete.mockResolvedValue(mockSession);

      await ProgressController.deleteSession(mockReq, mockRes);

      expect(mockPrisma.workoutSession.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Session deleted successfully",
      });
    });

    it("should return 404 if session not found", async () => {
      mockReq.params.id = "999";
      mockPrisma.workoutSession.findFirst.mockResolvedValue(null);

      await ProgressController.deleteSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Session not found",
      });
    });
  });

  describe("getExerciseProgress", () => {
    it("should return exercise progress history", async () => {
      const mockExercise = { id: 1, name: "Bench Press", description: null };
      const mockHistory = [
        {
          id: 1,
          sessionId: 1,
          exerciseId: 1,
          sets: 3,
          reps: 10,
          weight: 80,
          rest: 90,
          order: 1,
          notes: null,
          session: {
            id: 1,
            title: "Push Day",
            startedAt: new Date("2024-01-15"),
            completedAt: new Date("2024-01-15"),
          },
        },
        {
          id: 2,
          sessionId: 2,
          exerciseId: 1,
          sets: 3,
          reps: 10,
          weight: 75,
          rest: 90,
          order: 1,
          notes: null,
          session: {
            id: 2,
            title: "Push Day",
            startedAt: new Date("2024-01-10"),
            completedAt: new Date("2024-01-10"),
          },
        },
      ];

      mockReq.params.exerciseId = "1";
      mockPrisma.exercise.findUnique.mockResolvedValue(mockExercise);
      mockPrisma.sessionExercise.findMany.mockResolvedValue(mockHistory);

      await ProgressController.getExerciseProgress(mockReq, mockRes);

      expect(mockPrisma.exercise.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrisma.sessionExercise.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            exerciseId: 1,
          }),
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          exercise: mockExercise,
          history: mockHistory,
          stats: expect.objectContaining({
            totalSessions: 2,
            maxWeight: 80,
            maxReps: 10,
            avgWeight: 77.5,
            avgReps: 10,
          }),
        }),
      });
    });

    it("should return 404 if exercise not found", async () => {
      mockReq.params.exerciseId = "999";
      mockPrisma.exercise.findUnique.mockResolvedValue(null);

      await ProgressController.getExerciseProgress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Exercise not found",
      });
    });

    it("should filter progress by date range", async () => {
      mockReq.params.exerciseId = "1";
      mockReq.query = {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        limit: "10",
      };

      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: 1,
        name: "Squat",
      });
      mockPrisma.sessionExercise.findMany.mockResolvedValue([]);

      await ProgressController.getExerciseProgress(mockReq, mockRes);

      expect(mockPrisma.sessionExercise.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            session: expect.objectContaining({
              startedAt: {
                gte: new Date("2024-01-01"),
                lte: new Date("2024-12-31"),
              },
            }),
          }),
          take: 10,
        })
      );
    });
  });

  describe("getWorkoutStats", () => {
    it("should return workout statistics", async () => {
      const mockStats = {
        totalSessions: 10,
        completedSessions: 8,
        totalDuration: { _sum: { duration: 36000 } },
        mostUsedExercises: [
          { id: 1, name: "Squat", count: 5 },
          { id: 2, name: "Bench Press", count: 4 },
        ],
      };

      mockPrisma.workoutSession.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8);
      mockPrisma.workoutSession.aggregate.mockResolvedValue({
        _sum: { duration: 36000 },
      });
      mockPrisma.sessionExercise.groupBy.mockResolvedValue([
        { exerciseId: 1, _count: { exerciseId: 5 } },
        { exerciseId: 2, _count: { exerciseId: 4 } },
      ]);
      mockPrisma.exercise.findUnique
        .mockResolvedValueOnce({ id: 1, name: "Squat" })
        .mockResolvedValueOnce({ id: 2, name: "Bench Press" });

      await ProgressController.getWorkoutStats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalSessions: 10,
          completedSessions: 8,
          inProgressSessions: 2,
          totalDuration: 36000,
          avgDuration: 4500,
          mostUsedExercises: [
            { id: 1, name: "Squat", count: 5 },
            { id: 2, name: "Bench Press", count: 4 },
          ],
        }),
      });
    });

    it("should filter stats by date range", async () => {
      mockReq.query = {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      };

      mockPrisma.workoutSession.count.mockResolvedValue(0);
      mockPrisma.workoutSession.aggregate.mockResolvedValue({
        _sum: { duration: null },
      });
      mockPrisma.sessionExercise.groupBy.mockResolvedValue([]);

      await ProgressController.getWorkoutStats(mockReq, mockRes);

      expect(mockPrisma.workoutSession.count).toHaveBeenCalledWith({
        where: {
          userId: 1,
          startedAt: {
            gte: new Date("2024-01-01"),
            lte: new Date("2024-12-31"),
          },
        },
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors in createSession", async () => {
      mockReq.body = { title: "Test" };
      mockPrisma.$transaction.mockRejectedValue(new Error("Database error"));

      await ProgressController.createSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
      });
    });

    it("should handle database errors in getUserSessions", async () => {
      mockPrisma.workoutSession.findMany.mockRejectedValue(
        new Error("Database error")
      );

      await ProgressController.getUserSessions(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
      });
    });

    it("should handle database errors in getWorkoutStats", async () => {
      mockPrisma.workoutSession.count.mockRejectedValue(
        new Error("Database error")
      );

      await ProgressController.getWorkoutStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
      });
    });
  });
});
