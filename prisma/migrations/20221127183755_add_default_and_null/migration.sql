-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "panelURL" TEXT,
    "panelKey" TEXT
);
INSERT INTO "new_Settings" ("key", "panelKey", "panelURL") SELECT "key", "panelKey", "panelURL" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
