-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departDate" TEXT NOT NULL,
    "returnDate" TEXT,
    "cabin" TEXT NOT NULL,
    "adults" INTEGER NOT NULL,
    "children" INTEGER NOT NULL DEFAULT 0,
    "resultCount" INTEGER NOT NULL,
    "resultsJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
