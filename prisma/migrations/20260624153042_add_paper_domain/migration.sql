-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Paper_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaperVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paperId" TEXT NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "defaultDurationSeconds" INTEGER NOT NULL DEFAULT 7200,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaperVersion_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaperSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paperVersionId" TEXT NOT NULL,
    "sectionCode" TEXT,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaperSection_paperVersionId_fkey" FOREIGN KEY ("paperVersionId") REFERENCES "PaperVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paperVersionId" TEXT NOT NULL,
    "sectionId" TEXT,
    "questionNo" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "stem" TEXT NOT NULL,
    "answerKeyJson" TEXT NOT NULL,
    "explanationJson" TEXT,
    "difficulty" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuestionItem_paperVersionId_fkey" FOREIGN KEY ("paperVersionId") REFERENCES "PaperVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuestionItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "PaperSection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "optionKey" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuestionOption_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "QuestionItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "paperVersionId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'exam',
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSeconds" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "submittedAt" DATETIME,
    "lastAutosavedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attempt_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attempt_paperVersionId_fkey" FOREIGN KEY ("paperVersionId") REFERENCES "PaperVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttemptResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "answerJson" TEXT NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "isCorrect" BOOLEAN,
    "score" REAL,
    "gradedAt" DATETIME,
    "autosavedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AttemptResponse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttemptResponse_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "QuestionItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GradingResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "totalItems" INTEGER NOT NULL,
    "answeredItems" INTEGER NOT NULL,
    "correctItems" INTEGER NOT NULL,
    "wrongItems" INTEGER NOT NULL,
    "score" REAL NOT NULL,
    "accuracy" REAL NOT NULL,
    "gradedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GradingResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "paperId" TEXT,
    "source" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UploadedFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UploadedFile_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "uploadedFileId" TEXT,
    "paperId" TEXT,
    "paperVersionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ImportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ImportJob_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "UploadedFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ImportJob_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ImportJob_paperVersionId_fkey" FOREIGN KEY ("paperVersionId") REFERENCES "PaperVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParseJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "uploadedFileId" TEXT,
    "paperId" TEXT,
    "paperVersionId" TEXT,
    "parserName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ParseJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ParseJob_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "UploadedFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ParseJob_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ParseJob_paperVersionId_fkey" FOREIGN KEY ("paperVersionId") REFERENCES "PaperVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mistake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "questionId" TEXT NOT NULL,
    "wrongCount" INTEGER NOT NULL DEFAULT 1,
    "lastWrongAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'new',
    "note" TEXT,
    "masteredAt" DATETIME,
    CONSTRAINT "Mistake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mistake_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Mistake" ("id", "lastWrongAt", "masteredAt", "note", "questionId", "status", "userId", "wrongCount") SELECT "id", "lastWrongAt", "masteredAt", "note", "questionId", "status", "userId", "wrongCount" FROM "Mistake";
DROP TABLE "Mistake";
ALTER TABLE "new_Mistake" RENAME TO "Mistake";
CREATE UNIQUE INDEX "Mistake_questionId_key" ON "Mistake"("questionId");
CREATE INDEX "Mistake_userId_idx" ON "Mistake"("userId");
CREATE INDEX "Mistake_status_idx" ON "Mistake"("status");
CREATE INDEX "Mistake_lastWrongAt_idx" ON "Mistake"("lastWrongAt");
CREATE TABLE "new_PracticeRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "questionId" TEXT NOT NULL,
    "practiceType" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "practicedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticeRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PracticeRecord_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PracticeRecord" ("id", "isCorrect", "practiceType", "practicedAt", "questionId", "timeSpentSeconds", "userAnswer", "userId") SELECT "id", "isCorrect", "practiceType", "practicedAt", "questionId", "timeSpentSeconds", "userAnswer", "userId" FROM "PracticeRecord";
DROP TABLE "PracticeRecord";
ALTER TABLE "new_PracticeRecord" RENAME TO "PracticeRecord";
CREATE INDEX "PracticeRecord_userId_idx" ON "PracticeRecord"("userId");
CREATE INDEX "PracticeRecord_questionId_idx" ON "PracticeRecord"("questionId");
CREATE INDEX "PracticeRecord_practiceType_idx" ON "PracticeRecord"("practiceType");
CREATE INDEX "PracticeRecord_practicedAt_idx" ON "PracticeRecord"("practicedAt");
CREATE INDEX "PracticeRecord_isCorrect_idx" ON "PracticeRecord"("isCorrect");
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
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
    "imageUrl" TEXT,
    "imagePrompt" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("answer", "createdAt", "difficulty", "explanationZh", "grammarPoint", "id", "imagePrompt", "imageUrl", "listeningScript", "optionsJson", "prompt", "source", "subtype", "tagsJson", "type", "userId") SELECT "answer", "createdAt", "difficulty", "explanationZh", "grammarPoint", "id", "imagePrompt", "imageUrl", "listeningScript", "optionsJson", "prompt", "source", "subtype", "tagsJson", "type", "userId" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE INDEX "Question_userId_idx" ON "Question"("userId");
CREATE INDEX "Question_type_idx" ON "Question"("type");
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");
CREATE INDEX "Question_createdAt_idx" ON "Question"("createdAt");
CREATE TABLE "new_UserSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "defaultDifficulty" TEXT NOT NULL DEFAULT 'medium',
    "defaultQuestionCount" INTEGER NOT NULL DEFAULT 5,
    "speechRate" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserSetting" ("createdAt", "defaultDifficulty", "defaultQuestionCount", "id", "speechRate", "updatedAt", "userId") SELECT "createdAt", "defaultDifficulty", "defaultQuestionCount", "id", "speechRate", "updatedAt", "userId" FROM "UserSetting";
DROP TABLE "UserSetting";
ALTER TABLE "new_UserSetting" RENAME TO "UserSetting";
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Paper_userId_idx" ON "Paper"("userId");

-- CreateIndex
CREATE INDEX "Paper_status_idx" ON "Paper"("status");

-- CreateIndex
CREATE INDEX "Paper_createdAt_idx" ON "Paper"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Paper_userId_sourceKey_key" ON "Paper"("userId", "sourceKey");

-- CreateIndex
CREATE INDEX "PaperVersion_paperId_idx" ON "PaperVersion"("paperId");

-- CreateIndex
CREATE INDEX "PaperVersion_status_idx" ON "PaperVersion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PaperVersion_paperId_versionLabel_key" ON "PaperVersion"("paperId", "versionLabel");

-- CreateIndex
CREATE INDEX "PaperSection_paperVersionId_idx" ON "PaperSection"("paperVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "PaperSection_paperVersionId_orderIndex_key" ON "PaperSection"("paperVersionId", "orderIndex");

-- CreateIndex
CREATE INDEX "QuestionItem_paperVersionId_idx" ON "QuestionItem"("paperVersionId");

-- CreateIndex
CREATE INDEX "QuestionItem_sectionId_idx" ON "QuestionItem"("sectionId");

-- CreateIndex
CREATE INDEX "QuestionItem_itemType_idx" ON "QuestionItem"("itemType");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionItem_paperVersionId_questionNo_key" ON "QuestionItem"("paperVersionId", "questionNo");

-- CreateIndex
CREATE INDEX "QuestionOption_itemId_idx" ON "QuestionOption"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_itemId_optionKey_key" ON "QuestionOption"("itemId", "optionKey");

-- CreateIndex
CREATE INDEX "Attempt_userId_idx" ON "Attempt"("userId");

-- CreateIndex
CREATE INDEX "Attempt_paperVersionId_idx" ON "Attempt"("paperVersionId");

-- CreateIndex
CREATE INDEX "Attempt_status_idx" ON "Attempt"("status");

-- CreateIndex
CREATE INDEX "Attempt_expiresAt_idx" ON "Attempt"("expiresAt");

-- CreateIndex
CREATE INDEX "AttemptResponse_attemptId_idx" ON "AttemptResponse"("attemptId");

-- CreateIndex
CREATE INDEX "AttemptResponse_itemId_idx" ON "AttemptResponse"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptResponse_attemptId_itemId_key" ON "AttemptResponse"("attemptId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "GradingResult_attemptId_key" ON "GradingResult"("attemptId");

-- CreateIndex
CREATE INDEX "UploadedFile_userId_idx" ON "UploadedFile"("userId");

-- CreateIndex
CREATE INDEX "UploadedFile_paperId_idx" ON "UploadedFile"("paperId");

-- CreateIndex
CREATE INDEX "UploadedFile_sha256_idx" ON "UploadedFile"("sha256");

-- CreateIndex
CREATE INDEX "ImportJob_userId_idx" ON "ImportJob"("userId");

-- CreateIndex
CREATE INDEX "ImportJob_status_idx" ON "ImportJob"("status");

-- CreateIndex
CREATE INDEX "ParseJob_userId_idx" ON "ParseJob"("userId");

-- CreateIndex
CREATE INDEX "ParseJob_status_idx" ON "ParseJob"("status");
