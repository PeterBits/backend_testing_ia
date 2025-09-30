const express = require("express");
const { authenticateToken } = require("../middlewares/auth");
const {
  MetricsController,
  metricsValidation,
} = require("../controllers/metrics");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/metrics
 * @desc    Get user's body metrics
 * @access  Private
 */
router.get("/", MetricsController.getUserMetrics);

/**
 * @route   PUT /api/metrics
 * @desc    Create or update user's body metrics
 * @access  Private
 */
router.put("/", metricsValidation, MetricsController.upsertUserMetrics);

/**
 * @route   DELETE /api/metrics
 * @desc    Delete user's body metrics
 * @access  Private
 */
router.delete("/", MetricsController.deleteUserMetrics);

module.exports = router;
