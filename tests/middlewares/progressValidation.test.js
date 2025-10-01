// Validation tests for progress middleware - DO NOT mock express-validator
jest.mock("../../src/services/database");

const {
  createSessionValidation,
  updateSessionValidation,
} = require("../../src/middlewares/progressValidation");
const { validationResult } = require("express-validator");

describe("Progress Validation Middleware", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {};
  });

  describe("createSessionValidation", () => {
    describe("title validation", () => {
      it("should pass with valid title", async () => {
        mockReq.body = {
          title: "Morning Workout",
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail when title is empty", async () => {
        mockReq.body = {
          title: "",
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
        const titleError = errors.array().find((e) => e.path === "title");
        expect(titleError).toBeDefined();
      });

      it("should fail when title is too long", async () => {
        mockReq.body = {
          title: "a".repeat(101),
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
        const titleError = errors.array().find((e) => e.path === "title");
        expect(titleError).toBeDefined();
      });
    });

    describe("notes validation", () => {
      it("should pass with valid notes", async () => {
        mockReq.body = {
          title: "Test Workout",
          notes: "Felt great today!",
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail when notes exceed 1000 characters", async () => {
        mockReq.body = {
          title: "Test Workout",
          notes: "a".repeat(1001),
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
        const notesError = errors.array().find((e) => e.path === "notes");
        expect(notesError).toBeDefined();
      });
    });

    describe("routineId validation", () => {
      it("should pass with valid routineId", async () => {
        mockReq.body = {
          title: "Test Workout",
          routineId: 5,
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail with routineId less than 1", async () => {
        mockReq.body = {
          title: "Test Workout",
          routineId: 0,
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail with negative routineId", async () => {
        mockReq.body = {
          title: "Test Workout",
          routineId: -1,
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });
    });

    describe("startedAt validation", () => {
      it("should pass with valid ISO 8601 date", async () => {
        mockReq.body = {
          title: "Test Workout",
          startedAt: "2024-01-15T08:00:00Z",
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail with invalid date format", async () => {
        mockReq.body = {
          title: "Test Workout",
          startedAt: "not-a-date",
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });
    });

    describe("completedAt validation", () => {
      it("should pass with valid ISO 8601 date", async () => {
        mockReq.body = {
          title: "Test Workout",
          completedAt: "2024-01-15T09:30:00Z",
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail with invalid date format", async () => {
        mockReq.body = {
          title: "Test Workout",
          completedAt: "invalid-date",
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });
    });

    describe("duration validation", () => {
      it("should pass with valid duration", async () => {
        mockReq.body = {
          title: "Test Workout",
          duration: 3600,
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail with negative duration", async () => {
        mockReq.body = {
          title: "Test Workout",
          duration: -100,
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail with duration exceeding 24 hours", async () => {
        mockReq.body = {
          title: "Test Workout",
          duration: 86401,
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });
    });

    describe("exercises validation", () => {
      it("should pass with valid exercises array", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              weight: 80,
              rest: 90,
              order: 1,
              notes: "Felt strong",
            },
            {
              exerciseId: 2,
              sets: 4,
              reps: 12,
              weight: 60,
              rest: 60,
              order: 2,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail when exercises is not an array", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: "not-an-array",
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when exercise is not an object", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: ["not-an-object"],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when exerciseId is invalid", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 0,
              sets: 3,
              reps: 10,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when exerciseId is not an integer", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1.5,
              sets: 3,
              reps: 10,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when sets is less than 1", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 0,
              reps: 10,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when sets is greater than 50", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 51,
              reps: 10,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when sets is not an integer", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3.5,
              reps: 10,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when reps is less than 1", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 0,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when reps is greater than 500", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 501,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when reps is not an integer", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10.5,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should pass with valid weight", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              weight: 82.5,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail when weight is negative", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              weight: -10,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when weight exceeds 1000", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              weight: 1001,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should pass with valid rest time", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              rest: 90,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail when rest is negative", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              rest: -10,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when rest exceeds 3600 seconds", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              rest: 3601,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when rest is not an integer", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              rest: 90.5,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should pass with valid order", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              order: 5,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail when order is less than 1", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              order: 0,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when order is not an integer", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              order: 1.5,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should pass with valid exercise notes", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              notes: "Personal record!",
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail when exercise notes exceed 500 characters", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              notes: "a".repeat(501),
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should pass with null weight", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              weight: null,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should pass with null rest", async () => {
        mockReq.body = {
          title: "Test Workout",
          exercises: [
            {
              exerciseId: 1,
              sets: 3,
              reps: 10,
              rest: null,
            },
          ],
        };

        for (const validation of createSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });
    });
  });

  describe("updateSessionValidation", () => {
    describe("title validation", () => {
      it("should pass with valid title", async () => {
        mockReq.body = {
          title: "Updated Workout",
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should pass when title is not provided", async () => {
        mockReq.body = {
          notes: "Some notes",
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail when title is empty string", async () => {
        mockReq.body = {
          title: "",
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail when title is too long", async () => {
        mockReq.body = {
          title: "a".repeat(101),
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });
    });

    describe("completedAt validation", () => {
      it("should pass with valid ISO 8601 date", async () => {
        mockReq.body = {
          completedAt: "2024-01-15T09:30:00Z",
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should pass with null completedAt", async () => {
        mockReq.body = {
          completedAt: null,
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail with invalid date format", async () => {
        mockReq.body = {
          completedAt: "not-a-date",
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });
    });

    describe("duration validation", () => {
      it("should pass with valid duration", async () => {
        mockReq.body = {
          duration: 4200,
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail with negative duration", async () => {
        mockReq.body = {
          duration: -100,
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });

      it("should fail with duration exceeding 24 hours", async () => {
        mockReq.body = {
          duration: 90000,
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });
    });

    describe("exercises validation", () => {
      it("should pass with valid exercises array", async () => {
        mockReq.body = {
          exercises: [
            {
              exerciseId: 1,
              sets: 5,
              reps: 5,
              weight: 100,
              rest: 120,
              order: 1,
              notes: "Heavy day",
            },
          ],
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should pass when exercises is not provided", async () => {
        mockReq.body = {
          title: "Updated",
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail with invalid exercise data", async () => {
        mockReq.body = {
          exercises: [
            {
              exerciseId: 1,
              sets: 0, // Invalid
              reps: 10,
            },
          ],
        };

        for (const validation of updateSessionValidation) {
          await validation.run(mockReq);
        }

        const errors = validationResult(mockReq);
        expect(errors.isEmpty()).toBe(false);
      });
    });
  });
});
