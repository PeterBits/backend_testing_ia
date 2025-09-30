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

-- CreateIndex
CREATE UNIQUE INDEX "user_metrics_userId_key" ON "user_metrics"("userId");
