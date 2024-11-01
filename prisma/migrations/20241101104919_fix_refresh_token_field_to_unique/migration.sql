/*
  Warnings:

  - A unique constraint covering the columns `[refresh_token]` on the table `customer_sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "customer_sessions_refresh_token_key" ON "customer_sessions"("refresh_token");
