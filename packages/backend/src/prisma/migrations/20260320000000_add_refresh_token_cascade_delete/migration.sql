-- Drop the existing RESTRICT constraint and replace with CASCADE so that
-- deleting a Customer automatically removes their RefreshToken rows.
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_customerId_fkey";
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
