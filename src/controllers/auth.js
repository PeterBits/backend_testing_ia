const { body, validationResult } = require("express-validator");
const AuthUtils = require("../utils/auth");
const databaseService = require("../services/database");

class AuthController {
  /**
   * User registration
   */
  static async register(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data.",
          details: errors.array(),
        });
      }

      const { email, password, name, role } = req.body;
      const prisma = databaseService.getClient();

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          error: "Registration failed",
          message: "A user with this email already exists.",
        });
      }

      // Validate password strength
      const passwordValidation = AuthUtils.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: "Password validation failed",
          message: "Password does not meet security requirements.",
          details: passwordValidation.errors,
        });
      }

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          role: role || "ATHLETE", // Default to ATHLETE if not specified
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          // password excluded for security
        },
      });

      // Generate JWT token
      const token = AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user,
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: "Registration failed",
        message: "An error occurred during registration. Please try again.",
      });
    }
  }

  /**
   * User login
   */
  static async login(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data.",
          details: errors.array(),
        });
      }

      const { email, password } = req.body;
      const prisma = databaseService.getClient();

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          error: "Authentication failed",
          message: "Invalid email or password.",
        });
      }

      // Verify password
      const isPasswordValid = await AuthUtils.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Authentication failed",
          message: "Invalid email or password.",
        });
      }

      // Generate JWT token
      const token = AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Return user data (without password)
      const { password: _, ...userData } = user;

      res.json({
        success: true,
        message: "Login successful",
        user: userData,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: "Login failed",
        message: "An error occurred during login. Please try again.",
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      // User is already available from auth middleware
      res.json({
        success: true,
        user: req.user,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        error: "Profile retrieval failed",
        message: "An error occurred while retrieving your profile.",
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data.",
          details: errors.array(),
        });
      }

      const { name, email } = req.body;
      const prisma = databaseService.getClient();

      // Check if email is already taken by another user
      if (email && email !== req.user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return res.status(409).json({
            error: "Update failed",
            message: "This email is already in use by another account.",
          });
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: req.userId },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
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

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        error: "Profile update failed",
        message: "An error occurred while updating your profile.",
      });
    }
  }

  /**
   * Change user password
   */
  static async changePassword(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data.",
          details: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;
      const prisma = databaseService.getClient();

      // Get current user with password
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      // Verify current password
      const isCurrentPasswordValid = await AuthUtils.comparePassword(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          error: "Password change failed",
          message: "Current password is incorrect.",
        });
      }

      // Validate new password strength
      const passwordValidation =
        AuthUtils.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: "Password validation failed",
          message: "New password does not meet security requirements.",
          details: passwordValidation.errors,
        });
      }

      // Hash new password
      const hashedNewPassword = await AuthUtils.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: req.userId },
        data: { password: hashedNewPassword },
      });

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        error: "Password change failed",
        message: "An error occurred while changing your password.",
      });
    }
  }
}

// Validation middleware
const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),
  body("role")
    .optional()
    .isIn(["ATHLETE", "TRAINER"])
    .withMessage("Role must be either ATHLETE or TRAINER"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

module.exports = {
  AuthController,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
};
