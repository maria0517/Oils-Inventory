-- CreateTable
CREATE TABLE "Oil" (
    "id" SERIAL NOT NULL,
    "nameRo" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "smallBottles" INTEGER NOT NULL DEFAULT 0,
    "largeBottles" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Oil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Oil_nameRo_key" ON "Oil"("nameRo");

-- CreateIndex
CREATE UNIQUE INDEX "Oil_nameEn_key" ON "Oil"("nameEn");
