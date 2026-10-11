-- AlterTable
ALTER TABLE "public"."AnalyticsEvent" ADD COLUMN     "sucursalId" TEXT;

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sucursalId_idx" ON "public"."AnalyticsEvent"("sucursalId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sucursalId_type_idx" ON "public"."AnalyticsEvent"("sucursalId", "type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sucursalId_createdAt_idx" ON "public"."AnalyticsEvent"("sucursalId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "public"."Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
