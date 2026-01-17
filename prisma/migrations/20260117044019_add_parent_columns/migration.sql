-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "img" TEXT,
ADD COLUMN     "sex" "UserSex";

-- CreateTable
CREATE TABLE "Finance" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Finance_pkey" PRIMARY KEY ("id")
);
