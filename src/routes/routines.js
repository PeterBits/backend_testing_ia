const express = require("express");
const { authenticateToken, requireRole } = require("../middlewares/auth");
const {
  RoutineController,
  routineValidation,
  assignRoutineValidation,
  addAthleteValidation,
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

/**
 * @route   POST /api/routines/assign
 * @desc    Assign a routine to an athlete (TRAINER only)
 * @access  Private (TRAINER)
 */
router.post(
  "/assign",
  requireRole("TRAINER"),
  assignRoutineValidation,
  RoutineController.assignRoutineToAthlete
);

/**
 * @route   GET /api/routines/athletes
 * @desc    Get all athletes for a trainer (TRAINER only)
 * @access  Private (TRAINER)
 */
router.get(
  "/athletes",
  requireRole("TRAINER"),
  RoutineController.getTrainerAthletes
);

/**
 * @route   POST /api/routines/athletes
 * @desc    Add an athlete to a trainer (TRAINER only)
 * @access  Private (TRAINER)
 */
router.post(
  "/athletes",
  requireRole("TRAINER"),
  addAthleteValidation,
  RoutineController.addAthlete
);

/**
 * @route   DELETE /api/routines/athletes/:athleteId
 * @desc    Remove an athlete from a trainer (TRAINER only)
 * @access  Private (TRAINER)
 */
router.delete(
  "/athletes/:athleteId",
  requireRole("TRAINER"),
  RoutineController.removeAthlete
);

/**
 * @route   GET /api/routines/trainers
 * @desc    Get all trainers for an athlete (ATHLETE only)
 * @access  Private (ATHLETE)
 */
router.get(
  "/trainers",
  requireRole("ATHLETE"),
  RoutineController.getAthleteTrainers
);

module.exports = router;
