/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Avatar` table. All the data in the column will be lost.
  - Added the required column `Idle_downUrl` to the `Avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Idle_leftUrl` to the `Avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Idle_rightUrl` to the `Avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Idle_upUrl` to the `Avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Run_downUrl` to the `Avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Run_leftUrl` to the `Avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Run_rightUrl` to the `Avatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Run_upUrl` to the `Avatar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Avatar" DROP COLUMN "imageUrl",
ADD COLUMN     "Idle_downUrl" TEXT NOT NULL,
ADD COLUMN     "Idle_leftUrl" TEXT NOT NULL,
ADD COLUMN     "Idle_rightUrl" TEXT NOT NULL,
ADD COLUMN     "Idle_upUrl" TEXT NOT NULL,
ADD COLUMN     "Run_downUrl" TEXT NOT NULL,
ADD COLUMN     "Run_leftUrl" TEXT NOT NULL,
ADD COLUMN     "Run_rightUrl" TEXT NOT NULL,
ADD COLUMN     "Run_upUrl" TEXT NOT NULL;
