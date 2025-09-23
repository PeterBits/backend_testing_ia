const express = require("express");
const { authenticateToken } = require("../middlewares/auth");
const {
  AuthController,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require("../controllers/auth");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerValidation, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post("/login", loginValidation, AuthController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticateToken, AuthController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  authenticateToken,
  updateProfileValidation,
  AuthController.updateProfile
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  "/change-password",
  authenticateToken,
  changePasswordValidation,
  AuthController.changePassword
);

module.exports = router;
