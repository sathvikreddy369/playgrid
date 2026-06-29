-- CreateTable
CREATE TABLE "GroundReview" (
    "id" TEXT NOT NULL,
    "groundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroundReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroundReview_groundId_userId_key" ON "GroundReview"("groundId", "userId");

-- AddForeignKey
ALTER TABLE "GroundReview" ADD CONSTRAINT "GroundReview_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "Ground"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroundReview" ADD CONSTRAINT "GroundReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
