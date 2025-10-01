const { validationResult } = require("express-validator");
const databaseService = require("../services/database");

class ProgressController {
  /**
   * Create a new workout session
   */
  static async createSession(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const prisma = databaseService.getClient();
      const {
        routineId,
        title,
        notes,
        startedAt,
        completedAt,
        duration,
        exercises,
      } = req.body;

      // Verify routine exists and belongs to user (if provided)
      if (routineId) {
        const routine = await prisma.routine.findFirst({
          where: {
            id: routineId,
            userId: req.userId,
          },
        });

        if (!routine) {
          return res.status(404).json({
            success: false,
            message: "Routine not found or access denied",
          });
        }
      }

      // Verify all exercises exist
      if (exercises && exercises.length > 0) {
        const exerciseIds = exercises.map((e) => e.exerciseId);
        const existingExercises = await prisma.exercise.findMany({
          where: { id: { in: exerciseIds } },
          select: { id: true },
        });

        if (existingExercises.length !== exerciseIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more exercises not found",
          });
        }
      }

      // Create session with exercises in a transaction
      const session = await prisma.$transaction(async (tx) => {
        const newSession = await tx.workoutSession.create({
          data: {
            userId: req.userId,
            routineId: routineId || null,
            title,
            notes,
            startedAt: startedAt ? new Date(startedAt) : new Date(),
            completedAt: completedAt ? new Date(completedAt) : null,
            duration,
          },
        });

        // Create session exercises if provided
        if (exercises && exercises.length > 0) {
          const sessionExercises = exercises.map((ex, index) => ({
            sessionId: newSession.id,
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest: ex.rest,
            order: ex.order !== undefined ? ex.order : index + 1,
            notes: ex.notes,
          }));

          await tx.sessionExercise.createMany({
            data: sessionExercises,
          });
        }

        // Return session with exercises
        return await tx.workoutSession.findUnique({
          where: { id: newSession.id },
          include: {
            sessionExercises: {
              orderBy: { order: "asc" },
              include: {
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
            routine: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });
      });

      res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error("Create session error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get all workout sessions for the authenticated user
   */
  static async getUserSessions(req, res) {
    try {
      const prisma = databaseService.getClient();
      const { routineId, startDate, endDate, completed, limit, offset } =
        req.query;

      // Build where clause
      const where = { userId: req.userId };

      if (routineId) {
        where.routineId = parseInt(routineId);
      }

      if (completed !== undefined) {
        where.completedAt = completed === "true" ? { not: null } : null;
      }

      if (startDate || endDate) {
        where.startedAt = {};
        if (startDate) {
          where.startedAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.startedAt.lte = new Date(endDate);
        }
      }

      const sessions = await prisma.workoutSession.findMany({
        where,
        include: {
          sessionExercises: {
            orderBy: { order: "asc" },
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          routine: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { startedAt: "desc" },
        take: limit ? parseInt(limit) : undefined,
        skip: offset ? parseInt(offset) : undefined,
      });

      res.json({
        success: true,
        data: sessions,
        count: sessions.length,
      });
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get a specific workout session by ID
   */
  static async getSessionById(req, res) {
    try {
      const prisma = databaseService.getClient();
      const sessionId = parseInt(req.params.id);

      const session = await prisma.workoutSession.findFirst({
        where: {
          id: sessionId,
          userId: req.userId,
        },
        include: {
          sessionExercises: {
            orderBy: { order: "asc" },
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          routine: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Session not found",
        });
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error("Get session by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update a workout session
   */
  static async updateSession(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const prisma = databaseService.getClient();
      const sessionId = parseInt(req.params.id);
      const { title, notes, completedAt, duration, exercises } = req.body;

      // Verify session exists and belongs to user
      const existingSession = await prisma.workoutSession.findFirst({
        where: {
          id: sessionId,
          userId: req.userId,
        },
      });

      if (!existingSession) {
        return res.status(404).json({
          success: false,
          message: "Session not found",
        });
      }

      // Verify all exercises exist (if provided)
      if (exercises && exercises.length > 0) {
        const exerciseIds = exercises.map((e) => e.exerciseId);
        const existingExercises = await prisma.exercise.findMany({
          where: { id: { in: exerciseIds } },
          select: { id: true },
        });

        if (existingExercises.length !== exerciseIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more exercises not found",
          });
        }
      }

      // Update session with exercises in a transaction
      const session = await prisma.$transaction(async (tx) => {
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (notes !== undefined) updateData.notes = notes;
        if (completedAt !== undefined)
          updateData.completedAt = completedAt ? new Date(completedAt) : null;
        if (duration !== undefined) updateData.duration = duration;

        await tx.workoutSession.update({
          where: { id: sessionId },
          data: updateData,
        });

        // Update exercises if provided
        if (exercises && exercises.length > 0) {
          // Delete existing exercises
          await tx.sessionExercise.deleteMany({
            where: { sessionId },
          });

          // Create new exercises
          const sessionExercises = exercises.map((ex, index) => ({
            sessionId,
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest: ex.rest,
            order: ex.order !== undefined ? ex.order : index + 1,
            notes: ex.notes,
          }));

          await tx.sessionExercise.createMany({
            data: sessionExercises,
          });
        }

        // Return updated session with exercises
        return await tx.workoutSession.findUnique({
          where: { id: sessionId },
          include: {
            sessionExercises: {
              orderBy: { order: "asc" },
              include: {
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
            routine: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });
      });

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error("Update session error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Delete a workout session
   */
  static async deleteSession(req, res) {
    try {
      const prisma = databaseService.getClient();
      const sessionId = parseInt(req.params.id);

      // Verify session exists and belongs to user
      const session = await prisma.workoutSession.findFirst({
        where: {
          id: sessionId,
          userId: req.userId,
        },
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Session not found",
        });
      }

      await prisma.workoutSession.delete({
        where: { id: sessionId },
      });

      res.json({
        success: true,
        message: "Session deleted successfully",
      });
    } catch (error) {
      console.error("Delete session error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get exercise progress history (weight/reps over time)
   */
  static async getExerciseProgress(req, res) {
    try {
      const prisma = databaseService.getClient();
      const exerciseId = parseInt(req.params.exerciseId);
      const { startDate, endDate, limit } = req.query;

      // Verify exercise exists
      const exercise = await prisma.exercise.findUnique({
        where: { id: exerciseId },
      });

      if (!exercise) {
        return res.status(404).json({
          success: false,
          message: "Exercise not found",
        });
      }

      // Build where clause
      const where = {
        exerciseId,
        session: {
          userId: req.userId,
          completedAt: { not: null }, // Only completed sessions
        },
      };

      if (startDate || endDate) {
        where.session.startedAt = {};
        if (startDate) {
          where.session.startedAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.session.startedAt.lte = new Date(endDate);
        }
      }

      const history = await prisma.sessionExercise.findMany({
        where,
        include: {
          session: {
            select: {
              id: true,
              title: true,
              startedAt: true,
              completedAt: true,
            },
          },
        },
        orderBy: {
          session: {
            startedAt: "desc",
          },
        },
        take: limit ? parseInt(limit) : undefined,
      });

      // Calculate progress statistics
      const stats = {
        totalSessions: history.length,
        maxWeight: history.reduce(
          (max, h) => Math.max(max, h.weight || 0),
          0
        ),
        maxReps: history.reduce((max, h) => Math.max(max, h.reps || 0), 0),
        avgWeight:
          history.reduce((sum, h) => sum + (h.weight || 0), 0) /
            (history.length || 1),
        avgReps:
          history.reduce((sum, h) => sum + (h.reps || 0), 0) /
            (history.length || 1),
      };

      res.json({
        success: true,
        data: {
          exercise,
          history,
          stats,
        },
      });
    } catch (error) {
      console.error("Get exercise progress error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get overall workout statistics
   */
  static async getWorkoutStats(req, res) {
    try {
      const prisma = databaseService.getClient();
      const { startDate, endDate } = req.query;

      // Build where clause
      const where = { userId: req.userId };

      if (startDate || endDate) {
        where.startedAt = {};
        if (startDate) {
          where.startedAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.startedAt.lte = new Date(endDate);
        }
      }

      const [totalSessions, completedSessions, totalDuration, exerciseCounts] =
        await Promise.all([
          prisma.workoutSession.count({ where }),
          prisma.workoutSession.count({
            where: { ...where, completedAt: { not: null } },
          }),
          prisma.workoutSession.aggregate({
            where: { ...where, completedAt: { not: null } },
            _sum: { duration: true },
          }),
          prisma.sessionExercise.groupBy({
            by: ["exerciseId"],
            where: {
              session: where,
            },
            _count: { exerciseId: true },
            orderBy: {
              _count: {
                exerciseId: "desc",
              },
            },
            take: 5,
          }),
        ]);

      // Get most used exercises details
      const mostUsedExercises = await Promise.all(
        exerciseCounts.map(async (ec) => {
          const exercise = await prisma.exercise.findUnique({
            where: { id: ec.exerciseId },
            select: { id: true, name: true },
          });
          return {
            ...exercise,
            count: ec._count.exerciseId,
          };
        })
      );

      res.json({
        success: true,
        data: {
          totalSessions,
          completedSessions,
          inProgressSessions: totalSessions - completedSessions,
          totalDuration: totalDuration._sum.duration || 0,
          avgDuration:
            (totalDuration._sum.duration || 0) / (completedSessions || 1),
          mostUsedExercises,
        },
      });
    } catch (error) {
      console.error("Get workout stats error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = ProgressController;
