const { body, validationResult } = require("express-validator");
const databaseService = require("../services/database");

class RoutineController {
  /**
   * Get all routines for the authenticated user
   * Athletes see their own routines + routines assigned by trainers
   * Trainers see only their created routines
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
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
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
              role: true,
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
            createdBy: req.userId, // User creates their own routine
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

      // Check if routine exists and user is the creator (only creators can edit)
      const existingRoutine = await prisma.routine.findFirst({
        where: {
          id: parseInt(id),
          createdBy: req.userId, // Only creator can update
        },
      });

      if (!existingRoutine) {
        return res.status(404).json({
          error: "Routine not found",
          message:
            "The requested routine does not exist or you do not have permission to edit it.",
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

      // Check if routine exists and user is the creator (only creators can delete)
      const existingRoutine = await prisma.routine.findFirst({
        where: {
          id: parseInt(id),
          createdBy: req.userId, // Only creator can delete
        },
      });

      if (!existingRoutine) {
        return res.status(404).json({
          error: "Routine not found",
          message:
            "The requested routine does not exist or you do not have permission to delete it.",
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
   * Assign a routine to an athlete (TRAINER only)
   */
  static async assignRoutineToAthlete(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data.",
          details: errors.array(),
        });
      }

      const { athleteId, title, description, exercises = [] } = req.body;
      const prisma = databaseService.getClient();

      // Verify trainer-athlete relationship exists
      const relationship = await prisma.trainerAthlete.findFirst({
        where: {
          trainerId: req.userId,
          athleteId: athleteId,
        },
      });

      if (!relationship) {
        return res.status(403).json({
          error: "Permission denied",
          message: "You can only assign routines to your athletes.",
        });
      }

      // Create routine for the athlete
      const routine = await prisma.$transaction(async (tx) => {
        const newRoutine = await tx.routine.create({
          data: {
            title,
            description,
            userId: athleteId, // Routine belongs to athlete
            createdBy: req.userId, // But created by trainer
          },
        });

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

        return await tx.routine.findUnique({
          where: { id: newRoutine.id },
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
      });

      res.status(201).json({
        success: true,
        message: "Routine assigned to athlete successfully",
        data: routine,
      });
    } catch (error) {
      console.error("Assign routine error:", error);
      res.status(500).json({
        error: "Failed to assign routine",
        message: "An error occurred while assigning the routine.",
      });
    }
  }

  /**
   * Get all athletes for a trainer (TRAINER only)
   */
  static async getTrainerAthletes(req, res) {
    try {
      const prisma = databaseService.getClient();

      const relationships = await prisma.trainerAthlete.findMany({
        where: { trainerId: req.userId },
        include: {
          athlete: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
              _count: {
                select: { routines: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const athletes = relationships.map((rel) => ({
        ...rel.athlete,
        relationshipSince: rel.createdAt,
      }));

      res.json({
        success: true,
        data: athletes,
        count: athletes.length,
      });
    } catch (error) {
      console.error("Get athletes error:", error);
      res.status(500).json({
        error: "Failed to retrieve athletes",
        message: "An error occurred while fetching your athletes.",
      });
    }
  }

  /**
   * Get all trainers for an athlete (ATHLETE only)
   */
  static async getAthleteTrainers(req, res) {
    try {
      const prisma = databaseService.getClient();

      const relationships = await prisma.trainerAthlete.findMany({
        where: { athleteId: req.userId },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const trainers = relationships.map((rel) => ({
        ...rel.trainer,
        relationshipSince: rel.createdAt,
      }));

      res.json({
        success: true,
        data: trainers,
        count: trainers.length,
      });
    } catch (error) {
      console.error("Get trainers error:", error);
      res.status(500).json({
        error: "Failed to retrieve trainers",
        message: "An error occurred while fetching your trainers.",
      });
    }
  }

  /**
   * Add athlete to trainer (TRAINER only)
   */
  static async addAthlete(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data.",
          details: errors.array(),
        });
      }

      const { athleteId } = req.body;
      const prisma = databaseService.getClient();

      // Verify athlete exists and has ATHLETE role
      const athlete = await prisma.user.findUnique({
        where: { id: athleteId },
      });

      if (!athlete) {
        return res.status(404).json({
          error: "Athlete not found",
          message: "The specified athlete does not exist.",
        });
      }

      if (athlete.role !== "ATHLETE") {
        return res.status(400).json({
          error: "Invalid user type",
          message: "The specified user is not an athlete.",
        });
      }

      // Check if relationship already exists
      const existing = await prisma.trainerAthlete.findFirst({
        where: {
          trainerId: req.userId,
          athleteId: athleteId,
        },
      });

      if (existing) {
        return res.status(409).json({
          error: "Relationship exists",
          message: "This athlete is already assigned to you.",
        });
      }

      // Create relationship
      const relationship = await prisma.trainerAthlete.create({
        data: {
          trainerId: req.userId,
          athleteId: athleteId,
        },
        include: {
          athlete: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: "Athlete added successfully",
        data: relationship,
      });
    } catch (error) {
      console.error("Add athlete error:", error);
      res.status(500).json({
        error: "Failed to add athlete",
        message: "An error occurred while adding the athlete.",
      });
    }
  }

  /**
   * Remove athlete from trainer (TRAINER only)
   */
  static async removeAthlete(req, res) {
    try {
      const { athleteId } = req.params;
      const prisma = databaseService.getClient();

      const relationship = await prisma.trainerAthlete.findFirst({
        where: {
          trainerId: req.userId,
          athleteId: parseInt(athleteId),
        },
      });

      if (!relationship) {
        return res.status(404).json({
          error: "Relationship not found",
          message: "This athlete is not assigned to you.",
        });
      }

      await prisma.trainerAthlete.delete({
        where: { id: relationship.id },
      });

      res.json({
        success: true,
        message: "Athlete removed successfully",
      });
    } catch (error) {
      console.error("Remove athlete error:", error);
      res.status(500).json({
        error: "Failed to remove athlete",
        message: "An error occurred while removing the athlete.",
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

const assignRoutineValidation = [
  body("athleteId")
    .isInt({ min: 1 })
    .withMessage("Valid athlete ID is required"),
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

const addAthleteValidation = [
  body("athleteId")
    .isInt({ min: 1 })
    .withMessage("Valid athlete ID is required"),
];

module.exports = {
  RoutineController,
  routineValidation,
  assignRoutineValidation,
  addAthleteValidation,
};
