const express = require("express");
const { authenticateToken } = require("../middlewares/auth");
const ProgressController = require("../controllers/progress");
const {
  createSessionValidation,
  updateSessionValidation,
} = require("../middlewares/progressValidation");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/progress/sessions
 * @desc    Get all workout sessions for the authenticated user
 * @access  Private
 * @query   routineId - Filter by routine ID
 * @query   startDate - Filter sessions after this date
 * @query   endDate - Filter sessions before this date
 * @query   completed - Filter by completion status (true/false)
 * @query   limit - Limit number of results
 * @query   offset - Offset for pagination
 */
router.get("/sessions", ProgressController.getUserSessions);

/**
 * @route   GET /api/progress/stats
 * @desc    Get overall workout statistics
 * @access  Private
 * @query   startDate - Filter stats after this date
 * @query   endDate - Filter stats before this date
 */
router.get("/stats", ProgressController.getWorkoutStats);

/**
 * @route   GET /api/progress/sessions/:id
 * @desc    Get a specific workout session by ID
 * @access  Private
 */
router.get("/sessions/:id", ProgressController.getSessionById);

/**
 * @route   POST /api/progress/sessions
 * @desc    Create a new workout session
 * @access  Private
 */
router.post(
  "/sessions",
  createSessionValidation,
  ProgressController.createSession
);

/**
 * @route   PUT /api/progress/sessions/:id
 * @desc    Update a workout session
 * @access  Private
 */
router.put(
  "/sessions/:id",
  updateSessionValidation,
  ProgressController.updateSession
);

/**
 * @route   DELETE /api/progress/sessions/:id
 * @desc    Delete a workout session
 * @access  Private
 */
router.delete("/sessions/:id", ProgressController.deleteSession);

/**
 * @route   GET /api/progress/exercises/:exerciseId
 * @desc    Get progress history for a specific exercise
 * @access  Private
 * @query   startDate - Filter history after this date
 * @query   endDate - Filter history before this date
 * @query   limit - Limit number of results
 */
router.get("/exercises/:exerciseId", ProgressController.getExerciseProgress);

module.exports = router;
