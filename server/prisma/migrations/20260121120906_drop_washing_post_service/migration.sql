/*
  Warnings:

  - You are about to drop the `washing_post_services` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "washing_post_services" DROP CONSTRAINT "washing_post_services_postId_fkey";

-- DropForeignKey
ALTER TABLE "washing_post_services" DROP CONSTRAINT "washing_post_services_serviceId_fkey";

-- DropTable
DROP TABLE "washing_post_services";

-- CreateTable
CREATE TABLE "_ServiceToWashingPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ServiceToWashingPost_AB_unique" ON "_ServiceToWashingPost"("A", "B");

-- CreateIndex
CREATE INDEX "_ServiceToWashingPost_B_index" ON "_ServiceToWashingPost"("B");

-- AddForeignKey
ALTER TABLE "_ServiceToWashingPost" ADD CONSTRAINT "_ServiceToWashingPost_A_fkey" FOREIGN KEY ("A") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceToWashingPost" ADD CONSTRAINT "_ServiceToWashingPost_B_fkey" FOREIGN KEY ("B") REFERENCES "washing_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
