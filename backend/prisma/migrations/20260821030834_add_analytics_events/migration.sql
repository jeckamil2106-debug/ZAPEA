-- CreateTable
CREATE TABLE "public"."AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "serviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_companyId_idx" ON "public"."AnalyticsEvent"("companyId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_companyId_type_idx" ON "public"."AnalyticsEvent"("companyId", "type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_companyId_createdAt_idx" ON "public"."AnalyticsEvent"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_serviceId_idx" ON "public"."AnalyticsEvent"("serviceId");

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
