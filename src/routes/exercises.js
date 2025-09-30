const express = require("express");
const { authenticateToken } = require("../middlewares/auth");
const {
  ExerciseController,
  exerciseValidation,
} = require("../controllers/exercises");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/exercises
 * @desc    Get all exercises from the catalog
 * @access  Private
 */
router.get("/", ExerciseController.getAllExercises);

/**
 * @route   GET /api/exercises/:id
 * @desc    Get a specific exercise by ID
 * @access  Private
 */
router.get("/:id", ExerciseController.getExerciseById);

/**
 * @route   POST /api/exercises
 * @desc    Create a new exercise (for future admin use)
 * @access  Private
 */
router.post("/", exerciseValidation, ExerciseController.createExercise);

module.exports = router;
