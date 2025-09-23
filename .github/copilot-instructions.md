<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Instructions for Gym Backend API

This is a Node.js backend API for a gym routine tracking application. Please follow these guidelines when suggesting code:

## Project Context

- **Backend**: Node.js + Express.js REST API
- **Database**: SQLite (development) with Prisma ORM
- **Authentication**: JWT with bcryptjs for password hashing
- **Validation**: express-validator for input validation
- **Security**: helmet, cors, express-rate-limit

## Code Style Guidelines

- Use ES6+ features (const/let, arrow functions, async/await)
- Use meaningful variable and function names
- Include error handling with try-catch blocks
- Add JSDoc comments for functions and classes
- Use consistent indentation (2 spaces)

## Security Practices

- Never log or expose passwords or JWT secrets
- Always validate and sanitize user input
- Use parameterized queries through Prisma
- Implement proper error handling without exposing internal details
- Include rate limiting for sensitive endpoints

## Database Patterns

- Use Prisma client for all database operations
- Implement transactions for multi-step operations
- Use proper foreign key relationships
- Include cascading deletes where appropriate
- Select only necessary fields to minimize data exposure

## API Response Format

Always return consistent JSON responses:

```javascript
// Success
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}

// Error
{
  "error": "Error type",
  "message": "User-friendly error message",
  "details": [ ... ] // Optional validation errors
}
```

## Authentication Flow

- Protected routes require JWT token in Authorization header
- Use middleware to verify tokens and attach user to request
- Implement proper token expiration and refresh strategies

## Validation Patterns

- Use express-validator for input validation
- Validate all required fields and data types
- Sanitize string inputs
- Check for reasonable limits on numeric values

## Error Handling

- Use appropriate HTTP status codes
- Log detailed errors server-side
- Return user-friendly messages client-side
- Don't expose stack traces in production

## Testing

- Write unit tests for controllers and utilities
- Include integration tests for API endpoints
- Test authentication flows thoroughly
- Validate error scenarios

When suggesting new features or modifications, ensure they follow these patterns and maintain consistency with the existing codebase.
