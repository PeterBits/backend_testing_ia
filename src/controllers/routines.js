const { body, validationResult } = require("express-validator");
const databaseService = require("../services/database");

class RoutineController {
  /**
   * Get all routines for the authenticated user
   */
  static async getUserRoutines(req, res) {
    try {
      const prisma = databaseService.getClient();

      const routines = await prisma.routine.findMany({
        where: { userId: req.userId },
        include: {
          exercises: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { exercises: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      res.json({
        success: true,
        data: routines,
        count: routines.length,
      });
    } catch (error) {
      console.error("Get routines error:", error);
      res.status(500).json({
        error: "Failed to retrieve routines",
        message: "An error occurred while fetching your routines.",
      });
    }
  }

  /**
   * Get a specific routine by ID
   */
  static async getRoutineById(req, res) {
    try {
      const { id } = req.params;
      const prisma = databaseService.getClient();

      const routine = await prisma.routine.findFirst({
        where: {
          id: parseInt(id),
          userId: req.userId, // Ensure user can only access their own routines
        },
        include: {
          exercises: {
            orderBy: { order: "asc" },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!routine) {
        return res.status(404).json({
          error: "Routine not found",
          message:
            "The requested routine does not exist or you do not have access to it.",
        });
      }

      res.json({
        success: true,
        data: routine,
      });
    } catch (error) {
      console.error("Get routine error:", error);
      res.status(500).json({
        error: "Failed to retrieve routine",
        message: "An error occurred while fetching the routine.",
      });
    }
  }

  /**
   * Create a new routine
   */
  static async createRoutine(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data.",
          details: errors.array(),
        });
      }

      const { title, description, exercises = [] } = req.body;
      const prisma = databaseService.getClient();

      // Create routine with exercises in a transaction
      const routine = await prisma.$transaction(async (tx) => {
        // Create the routine
        const newRoutine = await tx.routine.create({
          data: {
            title,
            description,
            userId: req.userId,
          },
        });

        // Create exercises if provided
        if (exercises.length > 0) {
          const exerciseData = exercises.map((exercise, index) => ({
            ...exercise,
            routineId: newRoutine.id,
            order: exercise.order || index + 1,
          }));

          await tx.exercise.createMany({
            data: exerciseData,
          });
        }

        // Return routine with exercises
        return await tx.routine.findUnique({
          where: { id: newRoutine.id },
          include: {
            exercises: {
              orderBy: { order: "asc" },
            },
          },
        });
      });

      res.status(201).json({
        success: true,
        message: "Routine created successfully",
        data: routine,
      });
    } catch (error) {
      console.error("Create routine error:", error);
      res.status(500).json({
        error: "Failed to create routine",
        message: "An error occurred while creating the routine.",
      });
    }
  }

  /**
   * Update an existing routine
   */
  static async updateRoutine(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data.",
          details: errors.array(),
        });
      }

      const { id } = req.params;
      const { title, description, exercises } = req.body;
      const prisma = databaseService.getClient();

      // Check if routine exists and belongs to user
      const existingRoutine = await prisma.routine.findFirst({
        where: {
          id: parseInt(id),
          userId: req.userId,
        },
      });

      if (!existingRoutine) {
        return res.status(404).json({
          error: "Routine not found",
          message:
            "The requested routine does not exist or you do not have access to it.",
        });
      }

      // Update routine in a transaction
      const updatedRoutine = await prisma.$transaction(async (tx) => {
        // Update routine basic info
        const routine = await tx.routine.update({
          where: { id: parseInt(id) },
          data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
          },
        });

        // If exercises are provided, replace all exercises
        if (exercises !== undefined) {
          // Delete existing exercises
          await tx.exercise.deleteMany({
            where: { routineId: parseInt(id) },
          });

          // Create new exercises
          if (exercises.length > 0) {
            const exerciseData = exercises.map((exercise, index) => ({
              ...exercise,
              routineId: parseInt(id),
              order: exercise.order || index + 1,
            }));

            await tx.exercise.createMany({
              data: exerciseData,
            });
          }
        }

        // Return updated routine with exercises
        return await tx.routine.findUnique({
          where: { id: parseInt(id) },
          include: {
            exercises: {
              orderBy: { order: "asc" },
            },
          },
        });
      });

      res.json({
        success: true,
        message: "Routine updated successfully",
        data: updatedRoutine,
      });
    } catch (error) {
      console.error("Update routine error:", error);
      res.status(500).json({
        error: "Failed to update routine",
        message: "An error occurred while updating the routine.",
      });
    }
  }

  /**
   * Delete a routine
   */
  static async deleteRoutine(req, res) {
    try {
      const { id } = req.params;
      const prisma = databaseService.getClient();

      // Check if routine exists and belongs to user
      const existingRoutine = await prisma.routine.findFirst({
        where: {
          id: parseInt(id),
          userId: req.userId,
        },
      });

      if (!existingRoutine) {
        return res.status(404).json({
          error: "Routine not found",
          message:
            "The requested routine does not exist or you do not have access to it.",
        });
      }

      // Delete routine (exercises will be deleted automatically due to cascade)
      await prisma.routine.delete({
        where: { id: parseInt(id) },
      });

      res.json({
        success: true,
        message: "Routine deleted successfully",
      });
    } catch (error) {
      console.error("Delete routine error:", error);
      res.status(500).json({
        error: "Failed to delete routine",
        message: "An error occurred while deleting the routine.",
      });
    }
  }

  /**
   * Get routine statistics for the user
   */
  static async getRoutineStats(req, res) {
    try {
      const prisma = databaseService.getClient();

      const stats = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          _count: {
            select: {
              routines: true,
            },
          },
          routines: {
            select: {
              _count: {
                select: {
                  exercises: true,
                },
              },
              createdAt: true,
            },
          },
        },
      });

      const totalRoutines = stats._count.routines;
      const totalExercises = stats.routines.reduce(
        (sum, routine) => sum + routine._count.exercises,
        0
      );

      // Get routines created in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRoutines = stats.routines.filter(
        (routine) => routine.createdAt >= thirtyDaysAgo
      ).length;

      res.json({
        success: true,
        data: {
          totalRoutines,
          totalExercises,
          recentRoutines,
          averageExercisesPerRoutine:
            totalRoutines > 0
              ? Math.round((totalExercises / totalRoutines) * 10) / 10
              : 0,
        },
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({
        error: "Failed to retrieve statistics",
        message: "An error occurred while fetching your statistics.",
      });
    }
  }
}

// Validation middleware
const exerciseValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Exercise name must be between 1 and 100 characters"),
  body("sets")
    .isInt({ min: 1, max: 50 })
    .withMessage("Sets must be between 1 and 50"),
  body("reps")
    .isInt({ min: 1, max: 500 })
    .withMessage("Reps must be between 1 and 500"),
  body("rest")
    .optional()
    .isInt({ min: 0, max: 3600 })
    .withMessage("Rest must be between 0 and 3600 seconds"),
  body("order")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Order must be a positive integer"),
];

const routineValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("exercises")
    .optional()
    .isArray()
    .withMessage("Exercises must be an array"),
  body("exercises.*")
    .optional()
    .custom((value, { req }) => {
      // Validate each exercise in the array
      if (typeof value !== "object") return false;
      if (!value.name || value.name.length < 1 || value.name.length > 100)
        return false;
      if (!Number.isInteger(value.sets) || value.sets < 1 || value.sets > 50)
        return false;
      if (!Number.isInteger(value.reps) || value.reps < 1 || value.reps > 500)
        return false;
      if (
        value.rest !== undefined &&
        (!Number.isInteger(value.rest) || value.rest < 0 || value.rest > 3600)
      )
        return false;
      if (
        value.order !== undefined &&
        (!Number.isInteger(value.order) || value.order < 1)
      )
        return false;
      return true;
    })
    .withMessage("Invalid exercise data"),
];

module.exports = {
  RoutineController,
  routineValidation,
};
