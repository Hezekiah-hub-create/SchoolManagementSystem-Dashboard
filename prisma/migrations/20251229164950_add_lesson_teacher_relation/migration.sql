/*
  Warnings:

  - You are about to drop the column `teacherId` on the `Lesson` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_teacherId_fkey";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "teacherId";

-- CreateTable
CREATE TABLE "_LessonTeacher" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LessonTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LessonTeacher_B_index" ON "_LessonTeacher"("B");

-- AddForeignKey
ALTER TABLE "_LessonTeacher" ADD CONSTRAINT "_LessonTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonTeacher" ADD CONSTRAINT "_LessonTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
