# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

REST API backend for a gym routine tracking application built with Node.js, Express, Prisma ORM, and SQLite (development) / PostgreSQL (production). Supports JWT authentication, role-based access control (ATHLETE/TRAINER), and full CRUD operations for workout routines and exercises. Trainers can manage multiple athletes and assign routines to them.

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Production server
npm start

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Database operations
npx prisma migrate dev --name <migration_name>  # Create and apply migration
npx prisma generate                              # Regenerate Prisma Client
npx prisma studio                                # Open Prisma Studio GUI
npm run prisma:studio                            # Shortcut for Prisma Studio
npm run prisma:generate                          # Shortcut for generate
```

## Architecture

### Core Structure

- **Server**: `src/server.js` - Express app with security middleware (helmet, CORS, rate limiting)
- **Database**: `src/services/database.js` - Singleton PrismaClient instance
- **Auth**: `src/utils/auth.js` - JWT and bcrypt utilities
- **Middleware**: `src/middlewares/auth.js` - Token authentication (`authenticateToken`, `optionalAuth`)
- **Controllers**: `src/controllers/` - Business logic for auth and routines
- **Routes**: `src/routes/` - API endpoint definitions

### Database Schema (Prisma)

Eight main models with cascading deletes:
- **User** (with Role: ATHLETE or TRAINER) → has many **Routine**, **WorkoutSession** → has one **UserMetrics**
- **Exercise** - Catalog of exercises (id, name, description)
- **Routine** - Workout routines with `userId` (owner) and `createdBy` (creator)
- **RoutineExercise** - Join table linking routines to exercises with sets, reps, weight, rest, order
- **TrainerAthlete** - Join table for N:N relationship between trainers and athletes
- **UserMetrics** - Optional body metrics (height, weight, age, gender, bodyFat, muscleMass)
- **WorkoutSession** - Logged workout sessions with startedAt, completedAt, duration, notes, optional routineId
- **SessionExercise** - Join table linking sessions to exercises with actual performed sets, reps, weight, rest, order, notes
- All relationships use `onDelete: Cascade` or `SetNull` (for optional routine reference in sessions)
- Database service is a singleton accessible via `databaseService.getClient()`

### Authentication Flow

1. JWT tokens generated with 7-day expiration (configurable)
2. Tokens include `issuer: "gym-backend"`, `audience: "gym-app"`, and `role`
3. Middleware extracts user from token and attaches to `req.user` (includes role) and `req.userId`
4. Role-based middleware `requireRole()` restricts endpoints by user role
5. Password hashing uses bcrypt with 12 rounds
6. Password validation requires: 6-128 chars, uppercase, lowercase, number

### Routine Management

- **Create/Update**: Uses Prisma transactions to ensure atomicity
- **Update behavior**: When exercises array is provided, ALL existing exercises are deleted and replaced
- **Exercise ordering**: Defaults to array index + 1 if not specified
- **Authorization**:
  - Athletes can view their routines (own + assigned by trainers)
  - Only routine creators can edit/delete routines
  - Trainers can assign routines to their athletes
- **Routine ownership**: `userId` = owner, `createdBy` = creator (may differ if trainer assigns to athlete)

### Progress Tracking

- **Workout Sessions**: Users log actual workout sessions with exercises performed
- **Session-Routine Link**: Sessions can optionally reference a routine (for tracking routine completion)
- **Create/Update**: Uses Prisma transactions to ensure atomicity
- **Update behavior**: When exercises array is provided, ALL existing session exercises are deleted and replaced
- **Session states**: In-progress (no `completedAt`) or completed (with `completedAt` timestamp)
- **Progress history**: Track weight, reps, sets over time for each exercise
- **Statistics**: Calculate total sessions, avg duration, most used exercises, PRs per exercise
- **Authorization**: Users can only view/edit their own workout sessions

### Validation

Uses `express-validator` with custom validators:

**Routines:**
- Routine title: 1-100 chars
- Routine description: 0-500 chars (optional)
- Exercise name: 1-100 chars
- Exercise description: 0-500 chars (optional)
- RoutineExercise sets: 1-50
- RoutineExercise reps: 1-500
- RoutineExercise weight: 0-1000 kg (optional, accepts decimals)
- RoutineExercise rest: 0-3600 seconds (optional)
- RoutineExercise requires valid `exerciseId` from catalog

**Workout Sessions:**
- Session title: 1-100 chars
- Session notes: 0-1000 chars (optional)
- Session duration: 0-86400 seconds (24 hours max, optional)
- startedAt/completedAt: ISO 8601 date format (optional)
- SessionExercise sets: 1-50
- SessionExercise reps: 1-500
- SessionExercise weight: 0-1000 kg (optional, accepts decimals)
- SessionExercise rest: 0-3600 seconds (optional)
- SessionExercise notes: 0-500 chars (optional)
- SessionExercise requires valid `exerciseId` from catalog

### Security Features

- **Rate limiting**: 100 requests/15min (general), 5 requests/15min (auth endpoints)
- **CORS**: Configured for localhost:3000 and localhost:5173 in dev
- **Helmet**: Security headers enabled
- **Body size limit**: 10mb JSON payloads
- **No password leakage**: User queries explicitly exclude password field

## Configuration

Required environment variables (see `.env`):
- `DATABASE_URL` - Prisma connection string (file:./dev.db for SQLite)
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production/test)

## Testing

- **Framework**: Jest
- **Test files**: `tests/**/*.test.js`
- **Setup**: `tests/setup.js` runs before all tests
- **Coverage**: Excludes `src/server.js`
- **Environment**: Set to "node" for Jest

## Switching to PostgreSQL

1. Update `prisma/schema.prisma`: Change `provider = "sqlite"` to `provider = "postgresql"`
2. Update `DATABASE_URL` to PostgreSQL connection string
3. Run `npx prisma migrate deploy` in production (not `migrate dev`)

## API Endpoints

### Authentication (`/api/auth/*`)
- `POST /register` - Register new user (optional `role` field: ATHLETE/TRAINER)
- `POST /login` - Login and get JWT token
- `GET /profile` - Get current user profile (includes role)
- `PUT /profile` - Update user profile
- `POST /change-password` - Change user password

### Routines (`/api/routines/*`)
All endpoints require `Authorization: Bearer <token>` header

**General (All authenticated users):**
- `GET /` - Get user's routines (athletes see own + assigned by trainers)
- `GET /stats` - Get routine statistics
- `GET /:id` - Get specific routine by ID
- `POST /` - Create new routine (sets self as owner and creator)
- `PUT /:id` - Update routine (only creator can update)
- `DELETE /:id` - Delete routine (only creator can delete)

**Trainer Only:**
- `POST /assign` - Assign routine to athlete
- `GET /athletes` - Get all trainer's athletes
- `POST /athletes` - Add athlete to trainer
- `DELETE /athletes/:athleteId` - Remove athlete from trainer

**Athlete Only:**
- `GET /trainers` - Get all athlete's trainers

### Exercises (`/api/exercises/*`)
All endpoints require `Authorization: Bearer <token>` header

- `GET /` - Get all exercises from catalog
- `GET /:id` - Get specific exercise by ID
- `POST /` - Create new exercise (for admin/future use)

### User Metrics (`/api/metrics`)
All endpoints require `Authorization: Bearer <token>` header

- `GET /` - Get user's body metrics
- `PUT /` - Create or update user's body metrics
- `DELETE /` - Delete user's body metrics

**Available metrics:**
- height (50-300 cm)
- weight (20-500 kg)
- age (1-150 years)
- gender (male, female, other, prefer_not_to_say)
- bodyFat (0-100%)
- muscleMass (0-500 kg)

All fields are optional and can be updated independently.

### Progress Tracking (`/api/progress/*`)
All endpoints require `Authorization: Bearer <token>` header

**Workout Sessions:**
- `GET /sessions` - Get all workout sessions for authenticated user
  - Query params: `routineId`, `startDate`, `endDate`, `completed` (true/false), `limit`, `offset`
- `GET /sessions/:id` - Get specific workout session by ID
- `POST /sessions` - Create new workout session (with optional exercises array)
- `PUT /sessions/:id` - Update workout session (only session owner can update)
- `DELETE /sessions/:id` - Delete workout session (only session owner can delete)

**Statistics & Progress:**
- `GET /stats` - Get overall workout statistics
  - Returns: total sessions, completed sessions, in-progress sessions, total duration, avg duration, most used exercises
  - Query params: `startDate`, `endDate`
- `GET /exercises/:exerciseId` - Get progress history for specific exercise
  - Returns: exercise details, historical performance data, stats (max weight, max reps, averages)
  - Query params: `startDate`, `endDate`, `limit`

**Session Request Body Example:**
```json
{
  "title": "Morning Workout",
  "routineId": 1,  // optional
  "notes": "Felt great today!",  // optional
  "startedAt": "2024-01-15T08:00:00Z",  // optional, defaults to now
  "completedAt": "2024-01-15T09:30:00Z",  // optional, null = in progress
  "duration": 5400,  // optional, in seconds
  "exercises": [  // optional
    {
      "exerciseId": 1,
      "sets": 4,
      "reps": 10,
      "weight": 80,  // optional
      "rest": 90,  // optional
      "order": 1,  // optional, defaults to array index + 1
      "notes": "PR!"  // optional
    }
  ]
}
```
