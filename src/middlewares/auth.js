const AuthUtils = require("../utils/auth");
const databaseService = require("../services/database");

/**
 * Middleware to authenticate users using JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message:
          "No token provided. Please include a Bearer token in the Authorization header.",
      });
    }

    // Verify the token
    const decoded = AuthUtils.verifyToken(token);

    // Get user from database to ensure they still exist
    const prisma = databaseService.getClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Note: password is excluded for security
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Access denied",
        message: "User not found. Please login again.",
      });
    }

    // Add user information to request object
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.message.includes("expired")) {
      return res.status(401).json({
        error: "Token expired",
        message: "Your session has expired. Please login again.",
      });
    }

    if (
      error.message.includes("Invalid") ||
      error.message.includes("verification failed")
    ) {
      return res.status(401).json({
        error: "Invalid token",
        message: "Invalid authentication token. Please login again.",
      });
    }

    return res.status(500).json({
      error: "Authentication error",
      message: "An error occurred during authentication.",
    });
  }
};

/**
 * Optional authentication middleware - adds user if token is present but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = AuthUtils.verifyToken(token);

      const prisma = databaseService.getClient();
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    console.warn("Optional auth failed:", error.message);
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
