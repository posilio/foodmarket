-- Sequential invoice number table: one row per paid order, unique within a year.
CREATE TABLE "InvoiceNumber" (
    "id"        SERIAL NOT NULL,
    "year"      INTEGER NOT NULL,
    "sequence"  INTEGER NOT NULL,
    "orderId"   TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvoiceNumber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InvoiceNumber_orderId_key"       ON "InvoiceNumber"("orderId");
CREATE UNIQUE INDEX "InvoiceNumber_year_sequence_key" ON "InvoiceNumber"("year", "sequence");
