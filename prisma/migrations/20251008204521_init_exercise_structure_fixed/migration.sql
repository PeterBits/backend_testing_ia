-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ATHLETE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "routines" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "userId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "routines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "routines_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "exercise_muscles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "is_front" BOOLEAN NOT NULL,
    "image_url_main" TEXT NOT NULL,
    "image_url_secondary" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "exercise_equipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "exercise_licenses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "full_name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_update" DATETIME NOT NULL,
    "last_update_global" DATETIME NOT NULL,
    "category_id" INTEGER NOT NULL,
    "license_id" INTEGER NOT NULL,
    "license_author" TEXT,
    CONSTRAINT "exercises_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "exercise_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exercises_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "exercise_licenses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_muscle_relations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "exercise_id" INTEGER NOT NULL,
    "muscle_id" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "exercise_muscle_relations_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exercise_muscle_relations_muscle_id_fkey" FOREIGN KEY ("muscle_id") REFERENCES "exercise_muscles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_equipment_relations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "exercise_id" INTEGER NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    CONSTRAINT "exercise_equipment_relations_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exercise_equipment_relations_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "exercise_equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_images" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "style" TEXT NOT NULL,
    "license_id" INTEGER NOT NULL,
    "license_title" TEXT NOT NULL,
    "license_object_url" TEXT NOT NULL,
    "license_author" TEXT,
    "license_author_url" TEXT NOT NULL,
    "license_derivative_source_url" TEXT NOT NULL,
    "author_history" TEXT NOT NULL,
    CONSTRAINT "exercise_images_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exercise_images_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "exercise_licenses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_videos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "video" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "size" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "codec" TEXT NOT NULL,
    "codec_long" TEXT NOT NULL,
    "license_id" INTEGER NOT NULL,
    "license_title" TEXT NOT NULL,
    "license_object_url" TEXT NOT NULL,
    "license_author" TEXT,
    "license_author_url" TEXT NOT NULL,
    "license_derivative_source_url" TEXT NOT NULL,
    "author_history" TEXT NOT NULL,
    CONSTRAINT "exercise_videos_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exercise_videos_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "exercise_licenses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_translations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "language" INTEGER NOT NULL,
    "license_id" INTEGER NOT NULL,
    "license_title" TEXT NOT NULL,
    "license_object_url" TEXT NOT NULL,
    "license_author" TEXT,
    "license_author_url" TEXT NOT NULL,
    "license_derivative_source_url" TEXT NOT NULL,
    "author_history" TEXT NOT NULL,
    CONSTRAINT "exercise_translations_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exercise_translations_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "exercise_licenses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_translation_aliases" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "translation_id" INTEGER NOT NULL,
    "alias" TEXT NOT NULL,
    CONSTRAINT "exercise_translation_aliases_translation_id_fkey" FOREIGN KEY ("translation_id") REFERENCES "exercise_translations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_notes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "translation_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    CONSTRAINT "exercise_notes_translation_id_fkey" FOREIGN KEY ("translation_id") REFERENCES "exercise_translations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "routine_exercises" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "routineId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" REAL,
    "rest" INTEGER,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "routine_exercises_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "routines" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "routine_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "trainer_athlete" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trainerId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trainer_athlete_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "trainer_athlete_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_metrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "height" REAL,
    "weight" REAL,
    "age" INTEGER,
    "gender" TEXT,
    "bodyFat" REAL,
    "muscleMass" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "routineId" INTEGER,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "workout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workout_sessions_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "routines" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "session_exercises" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" REAL,
    "rest" INTEGER,
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "session_exercises_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "workout_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "session_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_uuid_key" ON "exercises"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_muscle_relations_exercise_id_muscle_id_is_primary_key" ON "exercise_muscle_relations"("exercise_id", "muscle_id", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_equipment_relations_exercise_id_equipment_id_key" ON "exercise_equipment_relations"("exercise_id", "equipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_images_uuid_key" ON "exercise_images"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_videos_uuid_key" ON "exercise_videos"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_translations_uuid_key" ON "exercise_translations"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_translation_aliases_uuid_key" ON "exercise_translation_aliases"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_notes_uuid_key" ON "exercise_notes"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_athlete_trainerId_athleteId_key" ON "trainer_athlete"("trainerId", "athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "user_metrics_userId_key" ON "user_metrics"("userId");
