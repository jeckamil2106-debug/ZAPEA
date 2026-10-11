-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "servicios" TEXT[] DEFAULT ARRAY[]::TEXT[];
