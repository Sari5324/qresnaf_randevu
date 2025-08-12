/*
  Warnings:

  - You are about to drop the column `propertyCard` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL DEFAULT 'Sanal Emlak',
    "companyLogo" TEXT,
    "description" TEXT,
    "themeColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "themeFont" TEXT NOT NULL DEFAULT 'inter',
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("companyLogo", "companyName", "createdAt", "darkMode", "description", "id", "themeColor", "themeFont", "updatedAt") SELECT "companyLogo", "companyName", "createdAt", "darkMode", "description", "id", "themeColor", "themeFont", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
