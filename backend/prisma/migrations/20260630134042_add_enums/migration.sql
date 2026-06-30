/*
  Warnings:

  - The `status` column on the `MatchPlayer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `TournamentParticipant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MatchPlayerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ATTENDED');

-- CreateEnum
CREATE TYPE "TournamentParticipantStatus" AS ENUM ('PENDING', 'APPROVED', 'ELIMINATED');

-- AlterTable
ALTER TABLE "Ground" ADD COLUMN     "aiSummary" TEXT;

-- AlterTable
ALTER TABLE "MatchPlayer" DROP COLUMN "status",
ADD COLUMN     "status" "MatchPlayerStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "favoriteGames" TEXT[],
ADD COLUMN     "homeLatitude" DOUBLE PRECISION,
ADD COLUMN     "homeLongitude" DOUBLE PRECISION,
ADD COLUMN     "preferredPlayTimes" TEXT[],
ADD COLUMN     "skillLevels" JSONB;

-- AlterTable
ALTER TABLE "TournamentParticipant" DROP COLUMN "status",
ADD COLUMN     "status" "TournamentParticipantStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MatchComment" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchComment_matchId_idx" ON "MatchComment"("matchId");

-- AddForeignKey
ALTER TABLE "MatchComment" ADD CONSTRAINT "MatchComment_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchComment" ADD CONSTRAINT "MatchComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
