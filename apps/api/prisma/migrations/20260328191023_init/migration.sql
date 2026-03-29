-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'OPERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ServiceVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'INTERNAL');

-- CreateEnum
CREATE TYPE "ServiceMode" AS ENUM ('IN_PERSON', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('OPEN', 'FULL', 'BLOCKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "AppointmentSource" AS ENUM ('WEB', 'STAFF', 'API', 'IMPORT');

-- CreateEnum
CREATE TYPE "AvailabilityExceptionType" AS ENUM ('BLOCK', 'ADDITIONAL_AVAILABILITY', 'CAPACITY_OVERRIDE');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "timezone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "categoryId" UUID,
    "branchId" UUID,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "ServiceVisibility" NOT NULL DEFAULT 'PUBLIC',
    "mode" "ServiceMode" NOT NULL DEFAULT 'IN_PERSON',
    "durationMinutes" INTEGER NOT NULL,
    "bufferBeforeMinutes" INTEGER NOT NULL DEFAULT 0,
    "bufferAfterMinutes" INTEGER NOT NULL DEFAULT 0,
    "slotCapacity" INTEGER NOT NULL DEFAULT 1,
    "allowOnlineBooking" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "requiresAuthentication" BOOLEAN NOT NULL DEFAULT false,
    "allowsCancellation" BOOLEAN NOT NULL DEFAULT true,
    "allowsReschedule" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffUser" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "email" VARCHAR(320) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "AppRole" NOT NULL DEFAULT 'OPERATOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citizen" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" VARCHAR(320),
    "phone" TEXT,
    "documentType" TEXT,
    "documentNumber" TEXT,
    "birthDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Citizen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityRule" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "staffUserId" UUID,
    "weekday" "Weekday" NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "slotDurationMinutes" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "validFrom" DATE,
    "validTo" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,
    "isRecurringAnnually" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityException" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "serviceId" UUID,
    "staffUserId" UUID,
    "type" "AvailabilityExceptionType" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "capacityOverride" INTEGER,
    "slotDurationMinutes" INTEGER,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "staffUserId" UUID,
    "availabilityRuleId" UUID,
    "availabilityExceptionId" UUID,
    "slotDate" DATE NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "reservedCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "status" "SlotStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "citizenId" UUID NOT NULL,
    "staffUserId" UUID,
    "slotId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "source" "AppointmentSource" NOT NULL DEFAULT 'WEB',
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "citizenNotes" TEXT,
    "internalNotes" TEXT,
    "checkedInAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentStatusHistory" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "appointmentId" UUID NOT NULL,
    "changedByStaffUserId" UUID,
    "fromStatus" "AppointmentStatus",
    "toStatus" "AppointmentStatus" NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentCancellation" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "appointmentId" UUID NOT NULL,
    "cancelledByStaffUserId" UUID,
    "reason" TEXT,
    "details" TEXT,
    "cancelledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentCancellation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentReschedule" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "appointmentId" UUID NOT NULL,
    "fromSlotId" UUID,
    "toSlotId" UUID,
    "rescheduledByStaffUserId" UUID,
    "previousStart" TIMESTAMP(3) NOT NULL,
    "previousEnd" TIMESTAMP(3) NOT NULL,
    "nextStart" TIMESTAMP(3) NOT NULL,
    "nextEnd" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentReschedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSettings" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "locale" TEXT,
    "timezone" TEXT,
    "bookingLeadTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "bookingCancellationWindowMinutes" INTEGER NOT NULL DEFAULT 0,
    "bookingRescheduleWindowMinutes" INTEGER NOT NULL DEFAULT 0,
    "defaultSlotCapacity" INTEGER NOT NULL DEFAULT 1,
    "defaultSlotDurationMinutes" INTEGER NOT NULL DEFAULT 30,
    "allowCitizenCancellation" BOOLEAN NOT NULL DEFAULT true,
    "allowCitizenReschedule" BOOLEAN NOT NULL DEFAULT true,
    "requireCitizenEmail" BOOLEAN NOT NULL DEFAULT false,
    "requireCitizenDocument" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Branch_tenantId_isActive_idx" ON "Branch"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_tenantId_slug_key" ON "Branch"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "ServiceCategory_tenantId_isActive_idx" ON "ServiceCategory"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_tenantId_slug_key" ON "ServiceCategory"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "Service_tenantId_categoryId_idx" ON "Service"("tenantId", "categoryId");

-- CreateIndex
CREATE INDEX "Service_tenantId_branchId_idx" ON "Service"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "Service_tenantId_visibility_isActive_idx" ON "Service"("tenantId", "visibility", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Service_tenantId_slug_key" ON "Service"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "StaffUser_tenantId_role_isActive_idx" ON "StaffUser"("tenantId", "role", "isActive");

-- CreateIndex
CREATE INDEX "StaffUser_tenantId_branchId_idx" ON "StaffUser"("tenantId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffUser_tenantId_email_key" ON "StaffUser"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Citizen_tenantId_email_idx" ON "Citizen"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Citizen_tenantId_documentType_documentNumber_idx" ON "Citizen"("tenantId", "documentType", "documentNumber");

-- CreateIndex
CREATE INDEX "Citizen_tenantId_lastName_firstName_idx" ON "Citizen"("tenantId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "AvailabilityRule_tenantId_branchId_weekday_isActive_idx" ON "AvailabilityRule"("tenantId", "branchId", "weekday", "isActive");

-- CreateIndex
CREATE INDEX "AvailabilityRule_tenantId_serviceId_weekday_isActive_idx" ON "AvailabilityRule"("tenantId", "serviceId", "weekday", "isActive");

-- CreateIndex
CREATE INDEX "AvailabilityRule_tenantId_staffUserId_weekday_isActive_idx" ON "AvailabilityRule"("tenantId", "staffUserId", "weekday", "isActive");

-- CreateIndex
CREATE INDEX "Holiday_tenantId_date_idx" ON "Holiday"("tenantId", "date");

-- CreateIndex
CREATE INDEX "Holiday_tenantId_branchId_date_idx" ON "Holiday"("tenantId", "branchId", "date");

-- CreateIndex
CREATE INDEX "AvailabilityException_tenantId_startsAt_endsAt_idx" ON "AvailabilityException"("tenantId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "AvailabilityException_tenantId_branchId_startsAt_idx" ON "AvailabilityException"("tenantId", "branchId", "startsAt");

-- CreateIndex
CREATE INDEX "AvailabilityException_tenantId_serviceId_startsAt_idx" ON "AvailabilityException"("tenantId", "serviceId", "startsAt");

-- CreateIndex
CREATE INDEX "TimeSlot_tenantId_slotDate_status_idx" ON "TimeSlot"("tenantId", "slotDate", "status");

-- CreateIndex
CREATE INDEX "TimeSlot_tenantId_branchId_slotDate_idx" ON "TimeSlot"("tenantId", "branchId", "slotDate");

-- CreateIndex
CREATE INDEX "TimeSlot_tenantId_serviceId_slotDate_idx" ON "TimeSlot"("tenantId", "serviceId", "slotDate");

-- CreateIndex
CREATE INDEX "TimeSlot_tenantId_staffUserId_slotDate_idx" ON "TimeSlot"("tenantId", "staffUserId", "slotDate");

-- CreateIndex
CREATE INDEX "TimeSlot_tenantId_startsAt_idx" ON "TimeSlot"("tenantId", "startsAt");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_status_scheduledStart_idx" ON "Appointment"("tenantId", "status", "scheduledStart");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_scheduledStart_idx" ON "Appointment"("tenantId", "scheduledStart");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_branchId_scheduledStart_idx" ON "Appointment"("tenantId", "branchId", "scheduledStart");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_branchId_status_scheduledStart_idx" ON "Appointment"("tenantId", "branchId", "status", "scheduledStart");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_citizenId_scheduledStart_idx" ON "Appointment"("tenantId", "citizenId", "scheduledStart");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_serviceId_scheduledStart_idx" ON "Appointment"("tenantId", "serviceId", "scheduledStart");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_slotId_idx" ON "Appointment"("tenantId", "slotId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_tenantId_code_key" ON "Appointment"("tenantId", "code");

-- CreateIndex
CREATE INDEX "AppointmentStatusHistory_tenantId_appointmentId_changedAt_idx" ON "AppointmentStatusHistory"("tenantId", "appointmentId", "changedAt");

-- CreateIndex
CREATE INDEX "AppointmentStatusHistory_tenantId_toStatus_changedAt_idx" ON "AppointmentStatusHistory"("tenantId", "toStatus", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentCancellation_appointmentId_key" ON "AppointmentCancellation"("appointmentId");

-- CreateIndex
CREATE INDEX "AppointmentCancellation_tenantId_cancelledAt_idx" ON "AppointmentCancellation"("tenantId", "cancelledAt");

-- CreateIndex
CREATE INDEX "AppointmentReschedule_tenantId_appointmentId_createdAt_idx" ON "AppointmentReschedule"("tenantId", "appointmentId", "createdAt");

-- CreateIndex
CREATE INDEX "AppointmentReschedule_tenantId_createdAt_idx" ON "AppointmentReschedule"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSettings_tenantId_key" ON "TenantSettings"("tenantId");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffUser" ADD CONSTRAINT "StaffUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffUser" ADD CONSTRAINT "StaffUser_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citizen" ADD CONSTRAINT "Citizen_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityRule" ADD CONSTRAINT "AvailabilityRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityRule" ADD CONSTRAINT "AvailabilityRule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityRule" ADD CONSTRAINT "AvailabilityRule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityRule" ADD CONSTRAINT "AvailabilityRule_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_availabilityRuleId_fkey" FOREIGN KEY ("availabilityRuleId") REFERENCES "AvailabilityRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_availabilityExceptionId_fkey" FOREIGN KEY ("availabilityExceptionId") REFERENCES "AvailabilityException"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentStatusHistory" ADD CONSTRAINT "AppointmentStatusHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentStatusHistory" ADD CONSTRAINT "AppointmentStatusHistory_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentStatusHistory" ADD CONSTRAINT "AppointmentStatusHistory_changedByStaffUserId_fkey" FOREIGN KEY ("changedByStaffUserId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentCancellation" ADD CONSTRAINT "AppointmentCancellation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentCancellation" ADD CONSTRAINT "AppointmentCancellation_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentCancellation" ADD CONSTRAINT "AppointmentCancellation_cancelledByStaffUserId_fkey" FOREIGN KEY ("cancelledByStaffUserId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReschedule" ADD CONSTRAINT "AppointmentReschedule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReschedule" ADD CONSTRAINT "AppointmentReschedule_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReschedule" ADD CONSTRAINT "AppointmentReschedule_fromSlotId_fkey" FOREIGN KEY ("fromSlotId") REFERENCES "TimeSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReschedule" ADD CONSTRAINT "AppointmentReschedule_toSlotId_fkey" FOREIGN KEY ("toSlotId") REFERENCES "TimeSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReschedule" ADD CONSTRAINT "AppointmentReschedule_rescheduledByStaffUserId_fkey" FOREIGN KEY ("rescheduledByStaffUserId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
