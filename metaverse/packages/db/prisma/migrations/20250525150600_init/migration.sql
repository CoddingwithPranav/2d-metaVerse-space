-- AlterTable
ALTER TABLE "Map" ADD COLUMN     "backgroundId" TEXT;

-- CreateTable
CREATE TABLE "background" (
    "id" TEXT NOT NULL,
    "Url" TEXT NOT NULL,

    CONSTRAINT "background_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "background_id_key" ON "background"("id");

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "background"("id") ON DELETE SET NULL ON UPDATE CASCADE;
