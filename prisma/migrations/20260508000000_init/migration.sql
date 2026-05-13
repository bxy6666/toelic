-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "optionsJson" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "explanationZh" TEXT NOT NULL,
    "tagsJson" TEXT NOT NULL,
    "listeningScript" TEXT,
    "grammarPoint" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PracticeRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "practiceType" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "practicedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticeRecord_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mistake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "wrongCount" INTEGER NOT NULL DEFAULT 1,
    "lastWrongAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'new',
    "note" TEXT,
    "masteredAt" DATETIME,
    CONSTRAINT "Mistake_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "defaultDifficulty" TEXT NOT NULL DEFAULT 'medium',
    "defaultQuestionCount" INTEGER NOT NULL DEFAULT 5,
    "speechRate" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "Question"("type");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- CreateIndex
CREATE INDEX "Question_createdAt_idx" ON "Question"("createdAt");

-- CreateIndex
CREATE INDEX "PracticeRecord_questionId_idx" ON "PracticeRecord"("questionId");

-- CreateIndex
CREATE INDEX "PracticeRecord_practiceType_idx" ON "PracticeRecord"("practiceType");

-- CreateIndex
CREATE INDEX "PracticeRecord_practicedAt_idx" ON "PracticeRecord"("practicedAt");

-- CreateIndex
CREATE INDEX "PracticeRecord_isCorrect_idx" ON "PracticeRecord"("isCorrect");

-- CreateIndex
CREATE UNIQUE INDEX "Mistake_questionId_key" ON "Mistake"("questionId");

-- CreateIndex
CREATE INDEX "Mistake_status_idx" ON "Mistake"("status");

-- CreateIndex
CREATE INDEX "Mistake_lastWrongAt_idx" ON "Mistake"("lastWrongAt");
