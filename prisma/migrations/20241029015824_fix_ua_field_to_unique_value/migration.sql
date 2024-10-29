/*
  Warnings:

  - A unique constraint covering the columns `[ua]` on the table `user_agents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_agents_ua_key" ON "user_agents"("ua");
