// Validation tests for routines controller - DO NOT mock express-validator
jest.mock("../../src/services/database");

const {
  routineValidation,
  assignRoutineValidation,
} = require("../../src/controllers/routines");
const { validationResult } = require("express-validator");

describe("Routine Validation", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {};
  });

  describe("routineValidation - exercises field validation", () => {
    it("should fail when exercise is not an object", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: ["not an object"],
      };

      // Run all validators
      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when exerciseId is invalid", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 0, // Invalid: must be >= 1
            sets: 3,
            reps: 10,
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when exerciseId is not an integer", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1.5, // Invalid: must be integer
            sets: 3,
            reps: 10,
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when sets is less than 1", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 0, // Invalid: must be >= 1
            reps: 10,
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when sets is greater than 50", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 51, // Invalid: must be <= 50
            reps: 10,
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when sets is not an integer", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3.5, // Invalid: must be integer
            reps: 10,
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when reps is less than 1", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 0, // Invalid: must be >= 1
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when reps is greater than 500", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 501, // Invalid: must be <= 500
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when reps is not an integer", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10.5, // Invalid: must be integer
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when weight is not a number", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: "heavy", // Invalid: must be number
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when weight is negative", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: -5, // Invalid: must be >= 0
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when weight is greater than 1000", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: 1001, // Invalid: must be <= 1000
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when rest is not an integer", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            rest: 60.5, // Invalid: must be integer
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when rest is negative", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            rest: -5, // Invalid: must be >= 0
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when rest is greater than 3600", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            rest: 3601, // Invalid: must be <= 3600
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when order is not an integer", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            order: 1.5, // Invalid: must be integer
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when order is less than 1", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            order: 0, // Invalid: must be >= 1
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should pass with valid exercise data", async () => {
      mockReq.body = {
        title: "Test Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: 50,
            rest: 60,
            order: 1,
          },
        ],
      };

      for (const validation of routineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });
  });


  describe("assignRoutineValidation - exercises field validation", () => {
    it("should fail when exerciseId is invalid", async () => {
      mockReq.body = {
        athleteId: 1,
        title: "Assigned Routine",
        exercises: [
          {
            exerciseId: 0, // Invalid
            sets: 3,
            reps: 10,
          },
        ],
      };

      for (const validation of assignRoutineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when sets is invalid", async () => {
      mockReq.body = {
        athleteId: 1,
        title: "Assigned Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 51, // Invalid: > 50
            reps: 10,
          },
        ],
      };

      for (const validation of assignRoutineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when reps is invalid", async () => {
      mockReq.body = {
        athleteId: 1,
        title: "Assigned Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 501, // Invalid: > 500
          },
        ],
      };

      for (const validation of assignRoutineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when weight is invalid", async () => {
      mockReq.body = {
        athleteId: 1,
        title: "Assigned Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            weight: -5, // Invalid: < 0
          },
        ],
      };

      for (const validation of assignRoutineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when rest is invalid", async () => {
      mockReq.body = {
        athleteId: 1,
        title: "Assigned Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            rest: -5, // Invalid: < 0
          },
        ],
      };

      for (const validation of assignRoutineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when order is invalid", async () => {
      mockReq.body = {
        athleteId: 1,
        title: "Assigned Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            order: 0, // Invalid: < 1
          },
        ],
      };

      for (const validation of assignRoutineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when exercise is not an object", async () => {
      mockReq.body = {
        athleteId: 1,
        title: "Assigned Routine",
        exercises: ["not an object"],
      };

      for (const validation of assignRoutineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should pass with valid exercise data without weight and rest", async () => {
      mockReq.body = {
        athleteId: 1,
        title: "Assigned Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
            // weight and rest are undefined
          },
        ],
      };

      for (const validation of assignRoutineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should pass with valid exercise data", async () => {
      mockReq.body = {
        athleteId: 1,
        title: "Assigned Routine",
        exercises: [
          {
            exerciseId: 1,
            sets: 3,
            reps: 10,
          },
        ],
      };

      for (const validation of assignRoutineValidation) {
        await validation.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });
  });
});
