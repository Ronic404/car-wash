-- CreateIndex
CREATE INDEX "bookings_carId_idx" ON "bookings"("carId");

-- CreateIndex
CREATE INDEX "bookings_serviceId_idx" ON "bookings"("serviceId");

-- CreateIndex
CREATE INDEX "cars_userId_idx" ON "cars"("userId");

-- CreateIndex
CREATE INDEX "time_blocks_serviceId_idx" ON "time_blocks"("serviceId");
