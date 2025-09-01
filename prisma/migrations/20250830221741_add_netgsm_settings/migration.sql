-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL DEFAULT 'Sanal Randevu',
    "companyLogo" TEXT,
    "businessNumber" TEXT,
    "description" TEXT,
    "themeColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "themeFont" TEXT NOT NULL DEFAULT 'inter',
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "netgsmUsername" TEXT,
    "netgsmPassword" TEXT,
    "netgsmEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("businessNumber", "companyLogo", "companyName", "createdAt", "darkMode", "description", "id", "themeColor", "themeFont", "updatedAt") SELECT "businessNumber", "companyLogo", "companyName", "createdAt", "darkMode", "description", "id", "themeColor", "themeFont", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
