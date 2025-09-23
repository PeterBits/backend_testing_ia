const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthUtils {
  /**
   * Hash a password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a password with its hash
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} True if passwords match
   */
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate a JWT token
   * @param {object} payload - Data to include in token
   * @param {string} expiresIn - Token expiration time (default: 7d)
   * @returns {string} JWT token
   */
  static generateToken(payload, expiresIn = "7d") {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
      issuer: "gym-backend",
      audience: "gym-app",
    });
  }

  /**
   * Verify a JWT token
   * @param {string} token - JWT token to verify
   * @returns {object} Decoded token payload
   */
  static verifyToken(token) {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }

    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: "gym-backend",
        audience: "gym-app",
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      } else {
        throw new Error("Token verification failed");
      }
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Token or null if not found
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Generate a secure random token (for password reset, etc.)
   * @param {number} length - Token length (default: 32)
   * @returns {string} Random token
   */
  static generateSecureToken(length = 32) {
    const crypto = require("crypto");
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} Validation result with isValid and errors
   */
  static validatePasswordStrength(password) {
    const errors = [];

    if (!password) {
      errors.push("Password is required");
      return { isValid: false, errors };
    }

    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (password.length > 128) {
      errors.push("Password must not exceed 128 characters");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = AuthUtils;
