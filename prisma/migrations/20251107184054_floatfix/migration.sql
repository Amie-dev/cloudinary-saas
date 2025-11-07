/*
  Warnings:

  - You are about to alter the column `duration` on the `Video` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "publicId" TEXT NOT NULL,
    "originalSize" TEXT NOT NULL,
    "compressedSize" TEXT NOT NULL,
    "duration" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Video" ("compressedSize", "createdAt", "description", "duration", "id", "originalSize", "publicId", "title", "updatedAt") SELECT "compressedSize", "createdAt", "description", "duration", "id", "originalSize", "publicId", "title", "updatedAt" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
