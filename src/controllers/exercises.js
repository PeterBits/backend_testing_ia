const { body, validationResult } = require("express-validator");
const databaseService = require("../services/database");

class ExerciseController {
  /**
   * Get all exercises from the catalog
   */
  static async getAllExercises(req, res) {
    try {
      const prisma = databaseService.getClient();

      const exercises = await prisma.exercise.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: exercises,
        count: exercises.length,
      });
    } catch (error) {
      console.error("Get exercises error:", error);
      res.status(500).json({
        error: "Failed to retrieve exercises",
        message: "An error occurred while fetching exercises.",
      });
    }
  }

  /**
   * Get a specific exercise by ID
   */
  static async getExerciseById(req, res) {
    try {
      const { id } = req.params;
      const prisma = databaseService.getClient();

      const exercise = await prisma.exercise.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!exercise) {
        return res.status(404).json({
          error: "Exercise not found",
          message: "The requested exercise does not exist.",
        });
      }

      res.json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      console.error("Get exercise error:", error);
      res.status(500).json({
        error: "Failed to retrieve exercise",
        message: "An error occurred while fetching the exercise.",
      });
    }
  }

  /**
   * Create a new exercise (for future admin features)
   */
  static async createExercise(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data.",
          details: errors.array(),
        });
      }

      const { name, description } = req.body;
      const prisma = databaseService.getClient();

      // Check if exercise with same name exists
      const existingExercise = await prisma.exercise.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });

      if (existingExercise) {
        return res.status(409).json({
          error: "Exercise already exists",
          message: "An exercise with this name already exists.",
        });
      }

      const exercise = await prisma.exercise.create({
        data: {
          name,
          description: description || null,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "Exercise created successfully",
        data: exercise,
      });
    } catch (error) {
      console.error("Create exercise error:", error);
      res.status(500).json({
        error: "Failed to create exercise",
        message: "An error occurred while creating the exercise.",
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
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

module.exports = {
  ExerciseController,
  exerciseValidation,
};
