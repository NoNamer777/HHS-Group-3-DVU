-- AlterTable
-- Make password field optional (nullable) since Auth0 handles authentication
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- DropForeignKey
-- Drop the foreign key constraint from RefreshToken to User
ALTER TABLE "RefreshToken" DROP CONSTRAINT IF EXISTS "RefreshToken_userId_fkey";

-- DropIndex
-- Drop indexes on RefreshToken table
DROP INDEX IF EXISTS "RefreshToken_userId_idx";
DROP INDEX IF EXISTS "RefreshToken_token_idx";

-- DropTable
-- Drop the RefreshToken table completely as it's no longer used with Auth0
DROP TABLE IF EXISTS "RefreshToken";
