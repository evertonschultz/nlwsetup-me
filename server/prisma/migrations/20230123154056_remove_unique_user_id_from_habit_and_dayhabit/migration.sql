/*
  Warnings:

  - A unique constraint covering the columns `[day_id,habit_id]` on the table `day_habits` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "day_habits_day_id_habit_id_user_id_key";

-- DropIndex
DROP INDEX "habits_user_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "day_habits_day_id_habit_id_key" ON "day_habits"("day_id", "habit_id");
