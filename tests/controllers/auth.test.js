// Mock dependencies BEFORE imports
jest.mock("../../src/utils/auth");
jest.mock("../../src/services/database");
jest.mock("express-validator", () => ({
  body: jest.fn(() => ({
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(),
}));

const { AuthController } = require("../../src/controllers/auth");
const AuthUtils = require("../../src/utils/auth");
const databaseService = require("../../src/services/database");
const { validationResult } = require("express-validator");

describe("AuthController", () => {
  let mockReq;
  let mockRes;
  let mockPrisma;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request and response
    mockReq = {
      body: {},
      user: null,
      userId: null,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock Prisma client
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    databaseService.getClient.mockReturnValue(mockPrisma);

    // Mock validationResult to return no errors by default
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
  });

  describe("register", () => {
    const validRegisterData = {
      email: "test@example.com",
      password: "TestPassword123",
      name: "Test User",
    };

    it("should register a new user successfully", async () => {
      mockReq.body = validRegisterData;

      mockPrisma.user.findUnique.mockResolvedValue(null);
      AuthUtils.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });
      AuthUtils.hashPassword.mockResolvedValue("hashedPassword123");

      const mockUser = {
        id: 1,
        email: validRegisterData.email,
        name: validRegisterData.name,
        role: "ATHLETE",
        createdAt: new Date(),
      };

      mockPrisma.user.create.mockResolvedValue(mockUser);
      AuthUtils.generateToken.mockReturnValue("mock-jwt-token");

      await AuthController.register(mockReq, mockRes);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: validRegisterData.email },
      });
      expect(AuthUtils.validatePasswordStrength).toHaveBeenCalledWith(
        validRegisterData.password
      );
      expect(AuthUtils.hashPassword).toHaveBeenCalledWith(
        validRegisterData.password
      );
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: validRegisterData.email,
          password: "hashedPassword123",
          name: validRegisterData.name,
          role: "ATHLETE",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      expect(AuthUtils.generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "User registered successfully",
        user: mockUser,
        token: "mock-jwt-token",
      });
    });

    it("should register a user with TRAINER role", async () => {
      mockReq.body = { ...validRegisterData, role: "TRAINER" };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      AuthUtils.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });
      AuthUtils.hashPassword.mockResolvedValue("hashedPassword123");

      const mockUser = {
        id: 1,
        email: validRegisterData.email,
        name: validRegisterData.name,
        role: "TRAINER",
        createdAt: new Date(),
      };

      mockPrisma.user.create.mockResolvedValue(mockUser);
      AuthUtils.generateToken.mockReturnValue("mock-jwt-token");

      await AuthController.register(mockReq, mockRes);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: "TRAINER",
          }),
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { msg: "Please provide a valid email address", param: "email" },
        ],
      });

      await AuthController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Validation failed",
        message: "Please check your input data.",
        details: [
          { msg: "Please provide a valid email address", param: "email" },
        ],
      });
    });

    it("should return 409 if user already exists", async () => {
      mockReq.body = validRegisterData;

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: validRegisterData.email,
      });

      await AuthController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Registration failed",
        message: "A user with this email already exists.",
      });
    });

    it("should return 400 if password is weak", async () => {
      mockReq.body = validRegisterData;

      mockPrisma.user.findUnique.mockResolvedValue(null);
      AuthUtils.validatePasswordStrength.mockReturnValue({
        isValid: false,
        errors: ["Password must contain at least one uppercase letter"],
      });

      await AuthController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Password validation failed",
        message: "Password does not meet security requirements.",
        details: ["Password must contain at least one uppercase letter"],
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.body = validRegisterData;

      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      await AuthController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Registration failed",
        message: "An error occurred during registration. Please try again.",
      });
    });
  });

  describe("login", () => {
    const validLoginData = {
      email: "test@example.com",
      password: "TestPassword123",
    };

    it("should login user successfully", async () => {
      mockReq.body = validLoginData;

      const mockUser = {
        id: 1,
        email: validLoginData.email,
        password: "hashedPassword123",
        name: "Test User",
        role: "ATHLETE",
        createdAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      AuthUtils.comparePassword.mockResolvedValue(true);
      AuthUtils.generateToken.mockReturnValue("mock-jwt-token");

      await AuthController.login(mockReq, mockRes);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: validLoginData.email },
      });
      expect(AuthUtils.comparePassword).toHaveBeenCalledWith(
        validLoginData.password,
        mockUser.password
      );
      expect(AuthUtils.generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
        },
        token: "mock-jwt-token",
      });
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Password is required", param: "password" }],
      });

      await AuthController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Validation failed",
        message: "Please check your input data.",
        details: [{ msg: "Password is required", param: "password" }],
      });
    });

    it("should return 401 if user not found", async () => {
      mockReq.body = validLoginData;

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await AuthController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Authentication failed",
        message: "Invalid email or password.",
      });
    });

    it("should return 401 if password is incorrect", async () => {
      mockReq.body = validLoginData;

      const mockUser = {
        id: 1,
        email: validLoginData.email,
        password: "hashedPassword123",
        name: "Test User",
        role: "ATHLETE",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      AuthUtils.comparePassword.mockResolvedValue(false);

      await AuthController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Authentication failed",
        message: "Invalid email or password.",
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.body = validLoginData;

      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      await AuthController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Login failed",
        message: "An error occurred during login. Please try again.",
      });
    });
  });

  describe("getProfile", () => {
    it("should return user profile successfully", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: "ATHLETE",
        createdAt: new Date(),
      };

      mockReq.user = mockUser;

      await AuthController.getProfile(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        user: mockUser,
      });
    });
  });

  describe("updateProfile", () => {
    const mockUser = {
      id: 1,
      email: "old@example.com",
      name: "Old Name",
      role: "ATHLETE",
    };

    beforeEach(() => {
      mockReq.user = mockUser;
      mockReq.userId = mockUser.id;
    });

    it("should update user profile successfully", async () => {
      mockReq.body = {
        name: "New Name",
        email: "new@example.com",
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const updatedUser = {
        id: mockUser.id,
        email: "new@example.com",
        name: "New Name",
        role: mockUser.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);

      await AuthController.updateProfile(mockReq, mockRes);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "new@example.com" },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          name: "New Name",
          email: "new@example.com",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    });

    it("should update only name", async () => {
      mockReq.body = {
        name: "New Name",
      };

      const updatedUser = {
        id: mockUser.id,
        email: mockUser.email,
        name: "New Name",
        role: mockUser.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);

      await AuthController.updateProfile(mockReq, mockRes);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          name: "New Name",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { msg: "Please provide a valid email address", param: "email" },
        ],
      });

      await AuthController.updateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Validation failed",
        message: "Please check your input data.",
        details: [
          { msg: "Please provide a valid email address", param: "email" },
        ],
      });
    });

    it("should return 409 if email is already taken", async () => {
      mockReq.body = {
        email: "taken@example.com",
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 2,
        email: "taken@example.com",
      });

      await AuthController.updateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Update failed",
        message: "This email is already in use by another account.",
      });
    });

    it("should not check email if it's the same as current", async () => {
      mockReq.body = {
        name: "New Name",
        email: mockUser.email,
      };

      const updatedUser = {
        id: mockUser.id,
        email: mockUser.email,
        name: "New Name",
        role: mockUser.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);

      await AuthController.updateProfile(mockReq, mockRes);

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockReq.body = {
        name: "New Name",
      };

      mockPrisma.user.update.mockRejectedValue(new Error("Database error"));

      await AuthController.updateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Profile update failed",
        message: "An error occurred while updating your profile.",
      });
    });
  });

  describe("changePassword", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedOldPassword",
    };

    beforeEach(() => {
      mockReq.userId = mockUser.id;
      mockReq.body = {
        currentPassword: "OldPassword123",
        newPassword: "NewPassword456",
      };
    });

    it("should change password successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      AuthUtils.comparePassword.mockResolvedValue(true);
      AuthUtils.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });
      AuthUtils.hashPassword.mockResolvedValue("hashedNewPassword");
      mockPrisma.user.update.mockResolvedValue({});

      await AuthController.changePassword(mockReq, mockRes);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(AuthUtils.comparePassword).toHaveBeenCalledWith(
        "OldPassword123",
        mockUser.password
      );
      expect(AuthUtils.validatePasswordStrength).toHaveBeenCalledWith(
        "NewPassword456"
      );
      expect(AuthUtils.hashPassword).toHaveBeenCalledWith("NewPassword456");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: "hashedNewPassword" },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Password changed successfully",
      });
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { msg: "Current password is required", param: "currentPassword" },
        ],
      });

      await AuthController.changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Validation failed",
        message: "Please check your input data.",
        details: [
          { msg: "Current password is required", param: "currentPassword" },
        ],
      });
    });

    it("should return 401 if current password is incorrect", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      AuthUtils.comparePassword.mockResolvedValue(false);

      await AuthController.changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Password change failed",
        message: "Current password is incorrect.",
      });
    });

    it("should return 400 if new password is weak", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      AuthUtils.comparePassword.mockResolvedValue(true);
      AuthUtils.validatePasswordStrength.mockReturnValue({
        isValid: false,
        errors: ["Password must contain at least one uppercase letter"],
      });

      await AuthController.changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Password validation failed",
        message: "New password does not meet security requirements.",
        details: ["Password must contain at least one uppercase letter"],
      });
    });

    it("should return 500 if database error occurs", async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      await AuthController.changePassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Password change failed",
        message: "An error occurred while changing your password.",
      });
    });
  });
});
