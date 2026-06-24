-- Authentication and user-scoped data for V2 public sharing safety.
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "GenerationUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GenerationUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "Question" ADD COLUMN "userId" TEXT;
ALTER TABLE "PracticeRecord" ADD COLUMN "userId" TEXT;
ALTER TABLE "Mistake" ADD COLUMN "userId" TEXT;
ALTER TABLE "UserSetting" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE UNIQUE INDEX "GenerationUsage_userId_dateKey_key" ON "GenerationUsage"("userId", "dateKey");
CREATE INDEX "GenerationUsage_dateKey_idx" ON "GenerationUsage"("dateKey");
CREATE INDEX "Question_userId_idx" ON "Question"("userId");
CREATE INDEX "PracticeRecord_userId_idx" ON "PracticeRecord"("userId");
CREATE INDEX "Mistake_userId_idx" ON "Mistake"("userId");
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");
