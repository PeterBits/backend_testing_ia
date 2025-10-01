const { body } = require("express-validator");

const createSessionValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
  body("routineId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Routine ID must be a positive integer"),
  body("startedAt")
    .optional()
    .isISO8601()
    .withMessage("Started at must be a valid ISO 8601 date"),
  body("completedAt")
    .optional()
    .isISO8601()
    .withMessage("Completed at must be a valid ISO 8601 date"),
  body("duration")
    .optional()
    .isInt({ min: 0, max: 86400 })
    .withMessage("Duration must be between 0 and 86400 seconds (24 hours)"),
  body("exercises")
    .optional()
    .isArray()
    .withMessage("Exercises must be an array"),
  body("exercises.*")
    .optional()
    .custom((value) => {
      if (typeof value !== "object") return false;
      if (!Number.isInteger(value.exerciseId) || value.exerciseId < 1)
        return false;
      if (!Number.isInteger(value.sets) || value.sets < 1 || value.sets > 50)
        return false;
      if (!Number.isInteger(value.reps) || value.reps < 1 || value.reps > 500)
        return false;
      if (
        value.weight !== undefined &&
        value.weight !== null &&
        (typeof value.weight !== "number" ||
          value.weight < 0 ||
          value.weight > 1000)
      )
        return false;
      if (
        value.rest !== undefined &&
        value.rest !== null &&
        (!Number.isInteger(value.rest) || value.rest < 0 || value.rest > 3600)
      )
        return false;
      if (
        value.order !== undefined &&
        value.order !== null &&
        (!Number.isInteger(value.order) || value.order < 1)
      )
        return false;
      if (
        value.notes !== undefined &&
        value.notes !== null &&
        (typeof value.notes !== "string" || value.notes.length > 500)
      )
        return false;
      return true;
    })
    .withMessage(
      "Invalid exercise data - must include exerciseId, sets (1-50), reps (1-500). Optional: weight (0-1000kg), rest (0-3600s), order, notes (max 500 chars)"
    ),
];

const updateSessionValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
  body("completedAt")
    .optional()
    .custom((value) => {
      // Allow null or valid ISO 8601 date
      if (value === null) return true;
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
    })
    .withMessage("Completed at must be null or a valid ISO 8601 date"),
  body("duration")
    .optional()
    .isInt({ min: 0, max: 86400 })
    .withMessage("Duration must be between 0 and 86400 seconds (24 hours)"),
  body("exercises")
    .optional()
    .isArray()
    .withMessage("Exercises must be an array"),
  body("exercises.*")
    .optional()
    .custom((value) => {
      if (typeof value !== "object") return false;
      if (!Number.isInteger(value.exerciseId) || value.exerciseId < 1)
        return false;
      if (!Number.isInteger(value.sets) || value.sets < 1 || value.sets > 50)
        return false;
      if (!Number.isInteger(value.reps) || value.reps < 1 || value.reps > 500)
        return false;
      if (
        value.weight !== undefined &&
        value.weight !== null &&
        (typeof value.weight !== "number" ||
          value.weight < 0 ||
          value.weight > 1000)
      )
        return false;
      if (
        value.rest !== undefined &&
        value.rest !== null &&
        (!Number.isInteger(value.rest) || value.rest < 0 || value.rest > 3600)
      )
        return false;
      if (
        value.order !== undefined &&
        value.order !== null &&
        (!Number.isInteger(value.order) || value.order < 1)
      )
        return false;
      if (
        value.notes !== undefined &&
        value.notes !== null &&
        (typeof value.notes !== "string" || value.notes.length > 500)
      )
        return false;
      return true;
    })
    .withMessage(
      "Invalid exercise data - must include exerciseId, sets (1-50), reps (1-500). Optional: weight (0-1000kg), rest (0-3600s), order, notes (max 500 chars)"
    ),
];

module.exports = {
  createSessionValidation,
  updateSessionValidation,
};
