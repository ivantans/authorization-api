-- CreateEnum
CREATE TYPE "CustomerEmailStatus" AS ENUM ('VERIFIED', 'UNVERIFIED');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "email_status" "CustomerEmailStatus" NOT NULL DEFAULT 'UNVERIFIED';
