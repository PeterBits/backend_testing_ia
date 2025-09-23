const express = require("express");
const { authenticateToken } = require("../middlewares/auth");
const {
  RoutineController,
  routineValidation,
} = require("../controllers/routines");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/routines
 * @desc    Get all routines for the authenticated user
 * @access  Private
 */
router.get("/", RoutineController.getUserRoutines);

/**
 * @route   GET /api/routines/stats
 * @desc    Get routine statistics for the authenticated user
 * @access  Private
 */
router.get("/stats", RoutineController.getRoutineStats);

/**
 * @route   GET /api/routines/:id
 * @desc    Get a specific routine by ID
 * @access  Private
 */
router.get("/:id", RoutineController.getRoutineById);

/**
 * @route   POST /api/routines
 * @desc    Create a new routine
 * @access  Private
 */
router.post("/", routineValidation, RoutineController.createRoutine);

/**
 * @route   PUT /api/routines/:id
 * @desc    Update an existing routine
 * @access  Private
 */
router.put("/:id", routineValidation, RoutineController.updateRoutine);

/**
 * @route   DELETE /api/routines/:id
 * @desc    Delete a routine
 * @access  Private
 */
router.delete("/:id", RoutineController.deleteRoutine);

module.exports = router;
