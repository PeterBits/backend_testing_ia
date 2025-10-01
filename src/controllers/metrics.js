const { body, validationResult } = require("express-validator");
const databaseService = require("../services/database");

class MetricsController {
  /**
   * Get user metrics
   */
  static async getUserMetrics(req, res) {
    try {
      const prisma = databaseService.getClient();

      const metrics = await prisma.userMetrics.findUnique({
        where: { userId: req.userId },
        select: {
          id: true,
          height: true,
          weight: true,
          age: true,
          gender: true,
          bodyFat: true,
          muscleMass: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error("Get metrics error:", error);
      res.status(500).json({
        error: "Failed to retrieve metrics",
        message: "An error occurred while fetching your metrics.",
      });
    }
  }

  /**
   * Create or update user metrics
   */
  static async upsertUserMetrics(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data.",
          details: errors.array(),
        });
      }

      const { height, weight, age, gender, bodyFat, muscleMass } = req.body;
      const prisma = databaseService.getClient();

      // Upsert metrics (create if doesn't exist, update if exists)
      const metrics = await prisma.userMetrics.upsert({
        where: { userId: req.userId },
        update: {
          ...(height !== undefined && { height }),
          ...(weight !== undefined && { weight }),
          ...(age !== undefined && { age }),
          ...(gender !== undefined && { gender }),
          ...(bodyFat !== undefined && { bodyFat }),
          ...(muscleMass !== undefined && { muscleMass }),
        },
        create: {
          userId: req.userId,
          height: height || null,
          weight: weight || null,
          age: age || null,
          gender: gender || null,
          bodyFat: bodyFat || null,
          muscleMass: muscleMass || null,
        },
        select: {
          id: true,
          height: true,
          weight: true,
          age: true,
          gender: true,
          bodyFat: true,
          muscleMass: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: "Metrics updated successfully",
        data: metrics,
      });
    } catch (error) {
      console.error("Update metrics error:", error);
      res.status(500).json({
        error: "Failed to update metrics",
        message: "An error occurred while updating your metrics.",
      });
    }
  }

  /**
   * Delete user metrics
   */
  static async deleteUserMetrics(req, res) {
    try {
      const prisma = databaseService.getClient();

      const metrics = await prisma.userMetrics.findUnique({
        where: { userId: req.userId },
      });

      if (!metrics) {
        return res.status(404).json({
          error: "Metrics not found",
          message: "You don't have any metrics to delete.",
        });
      }

      await prisma.userMetrics.delete({
        where: { userId: req.userId },
      });

      res.json({
        success: true,
        message: "Metrics deleted successfully",
      });
    } catch (error) {
      console.error("Delete metrics error:", error);
      res.status(500).json({
        error: "Failed to delete metrics",
        message: "An error occurred while deleting your metrics.",
      });
    }
  }
}

// Validation middleware
const metricsValidation = [
  body("height")
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage("Height must be between 50 and 300 cm"),
  body("weight")
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage("Weight must be between 20 and 500 kg"),
  body("age")
    .optional()
    .isInt({ min: 1, max: 150 })
    .withMessage("Age must be between 1 and 150 years"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer_not_to_say"])
    .withMessage(
      "Gender must be one of: male, female, other, prefer_not_to_say"
    ),
  body("bodyFat")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Body fat must be between 0 and 100%"),
  body("muscleMass")
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage("Muscle mass must be between 0 and 500 kg"),
];

module.exports = {
  MetricsController,
  metricsValidation,
};
