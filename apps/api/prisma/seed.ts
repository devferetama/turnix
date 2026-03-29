import 'reflect-metadata';

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  AppRole,
  AppointmentSource,
  AppointmentStatus,
  Prisma,
  SlotStatus,
  Weekday,
} from '@prisma/client';
import { config as loadEnv } from 'dotenv';
import { PrismaModule } from '../src/infrastructure/database/prisma/prisma.module';
import { PrismaService } from '../src/infrastructure/database/prisma/prisma.service';
import { hashPassword } from '../src/modules/auth/utils/password.util';
import { SchedulingModule } from '../src/modules/scheduling/scheduling.module';
import { SlotGenerationService } from '../src/modules/scheduling/slot-generation.service';

for (const envFile of ['.env.local', '.env']) {
  const envPath = resolve(process.cwd(), envFile);

  if (existsSync(envPath)) {
    loadEnv({ path: envPath, override: false });
  }
}

const DEMO_TENANT_NAME = 'Turnix Demo';
const DEMO_TENANT_SLUG = 'demo';
const LEGACY_DEMO_TENANT_SLUG = 'turnix-dev';
const DEMO_TIMEZONE = 'America/Santiago';
const DEMO_LOCALE = 'es-CL';
const DEFAULT_PASSWORD = 'Turnix123!';
const SLOT_GENERATION_FUTURE_DAYS = 21;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    SchedulingModule,
  ],
})
class SeedModule {}

type SeedSummary = {
  tenantSlug: string;
  branchesCreated: number;
  servicesCreated: number;
  staffUsersCreated: number;
  citizensCreated: number;
  rulesCreated: number;
  generatedSlotsCreated: number;
  generatedSlotsSkipped: number;
  totalSlotsCreated: number;
  appointmentsCreated: number;
  demoCodes: string[];
  credentials: Array<{
    label: string;
    email: string;
    password: string;
    role: AppRole;
  }>;
};

async function main() {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: false,
  });

  try {
    const prisma = app.get(PrismaService);
    const slotGenerationService = app.get(SlotGenerationService);
    const summary = await seedDemoScenario(prisma, slotGenerationService);

    logSummary(summary);
  } finally {
    await app.close();
  }
}

async function seedDemoScenario(
  prisma: PrismaService,
  slotGenerationService: SlotGenerationService,
): Promise<SeedSummary> {
  await removeExistingDemoTenants(prisma);

  const tenant = await prisma.tenant.create({
    data: {
      slug: DEMO_TENANT_SLUG,
      name: DEMO_TENANT_NAME,
      timezone: DEMO_TIMEZONE,
      isActive: true,
    },
  });

  await prisma.tenantSettings.create({
    data: {
      tenantId: tenant.id,
      locale: DEMO_LOCALE,
      timezone: DEMO_TIMEZONE,
      bookingLeadTimeMinutes: 60,
      bookingCancellationWindowMinutes: 180,
      bookingRescheduleWindowMinutes: 180,
      defaultSlotCapacity: 1,
      defaultSlotDurationMinutes: 30,
      allowCitizenCancellation: true,
      allowCitizenReschedule: true,
      requireCitizenEmail: false,
      requireCitizenDocument: false,
    },
  });

  const [licenciasCategory, evaluacionesCategory, atencionCategory] =
    await Promise.all([
    prisma.serviceCategory.create({
      data: {
        tenantId: tenant.id,
        slug: 'licencias-conducir',
        name: 'Licencias de conducir',
        description: 'Servicios relacionados con evaluaciones para licencias.',
        sortOrder: 10,
        isActive: true,
      },
    }),
      prisma.serviceCategory.create({
        data: {
          tenantId: tenant.id,
          slug: 'evaluaciones',
          name: 'Evaluaciones',
          description: 'Servicios complementarios de evaluacion municipal.',
          sortOrder: 20,
          isActive: true,
        },
      }),
      prisma.serviceCategory.create({
        data: {
          tenantId: tenant.id,
          slug: 'atencion-ciudadana',
          name: 'Atención ciudadana',
          description:
            'Servicios de orientación y acompañamiento para la comunidad.',
          sortOrder: 30,
          isActive: true,
        },
      }),
    ]);

  const [branchCentro, branchNorte] = await Promise.all([
    prisma.branch.create({
      data: {
        tenantId: tenant.id,
        slug: 'sucursal-centro',
        name: 'Sucursal Centro',
        description:
          'Sucursal principal para tramites de licencias y atencion general.',
        timezone: DEMO_TIMEZONE,
        addressLine1: "Av. Libertador Bernardo O'Higgins 1234",
        city: 'Santiago',
        state: 'Metropolitana',
        country: 'Chile',
        postalCode: '8320000',
        isActive: true,
      },
    }),
    prisma.branch.create({
      data: {
        tenantId: tenant.id,
        slug: 'sucursal-norte',
        name: 'Sucursal Norte',
        description:
          'Punto de atencion para evaluaciones y acompanamiento vecinal.',
        timezone: DEMO_TIMEZONE,
        addressLine1: 'Av. Independencia 4567',
        city: 'Santiago',
        state: 'Metropolitana',
        country: 'Chile',
        postalCode: '8380000',
        isActive: true,
      },
    }),
  ]);

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const [tenantAdmin, centroOperator, norteOperator] = await Promise.all([
    prisma.staffUser.create({
      data: {
        tenantId: tenant.id,
        email: 'admin@turnix.local',
        passwordHash,
        firstName: 'Valentina',
        lastName: 'Administrador',
        role: AppRole.TENANT_ADMIN,
        isActive: true,
      },
    }),
    prisma.staffUser.create({
      data: {
        tenantId: tenant.id,
        branchId: branchCentro.id,
        email: 'camila.centro@turnix.local',
        passwordHash,
        firstName: 'Camila',
        lastName: 'Rojas',
        role: AppRole.OPERATOR,
        isActive: true,
      },
    }),
    prisma.staffUser.create({
      data: {
        tenantId: tenant.id,
        branchId: branchNorte.id,
        email: 'diego.norte@turnix.local',
        passwordHash,
        firstName: 'Diego',
        lastName: 'Fuentes',
        role: AppRole.OPERATOR,
        isActive: true,
      },
    }),
  ]);

  const [
    serviceTeorica,
    servicePractica,
    servicePsicotecnico,
    serviceRenovacion,
    serviceOrientacion,
  ] =
    await Promise.all([
      prisma.service.create({
        data: {
          tenantId: tenant.id,
          categoryId: licenciasCategory.id,
          branchId: branchCentro.id,
          slug: 'licencia-conducir-teorica',
          name: 'Licencia de conducir - Teórica',
          description:
            'Evaluacion teorica para postulantes y renovaciones de licencia.',
          durationMinutes: 30,
          bufferBeforeMinutes: 0,
          bufferAfterMinutes: 5,
          slotCapacity: 1,
          allowOnlineBooking: true,
          requiresApproval: false,
          requiresAuthentication: false,
          allowsCancellation: true,
          allowsReschedule: true,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          tenantId: tenant.id,
          categoryId: licenciasCategory.id,
          branchId: branchCentro.id,
          slug: 'licencia-conducir-practica',
          name: 'Licencia de conducir - Práctica',
          description:
            'Bloques de evaluacion practica coordinados por operadores municipales.',
          visibility: 'PRIVATE',
          durationMinutes: 45,
          bufferBeforeMinutes: 10,
          bufferAfterMinutes: 10,
          slotCapacity: 1,
          allowOnlineBooking: false,
          requiresApproval: true,
          requiresAuthentication: false,
          allowsCancellation: true,
          allowsReschedule: true,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          tenantId: tenant.id,
          categoryId: evaluacionesCategory.id,
          branchId: branchNorte.id,
          slug: 'examen-psicotecnico',
          name: 'Examen psicotécnico',
          description:
            'Evaluacion psicotecnica requerida antes de la emision final.',
          durationMinutes: 30,
          bufferBeforeMinutes: 0,
          bufferAfterMinutes: 10,
          slotCapacity: 2,
          allowOnlineBooking: true,
          requiresApproval: true,
          requiresAuthentication: false,
          allowsCancellation: true,
          allowsReschedule: true,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          tenantId: tenant.id,
          categoryId: licenciasCategory.id,
          branchId: branchNorte.id,
          slug: 'renovacion-licencia-express',
          name: 'Renovación de licencia - Express',
          description:
            'Bloques breves para renovación y validación documental de licencias.',
          durationMinutes: 20,
          bufferBeforeMinutes: 0,
          bufferAfterMinutes: 10,
          slotCapacity: 2,
          allowOnlineBooking: true,
          requiresApproval: false,
          requiresAuthentication: false,
          allowsCancellation: true,
          allowsReschedule: true,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          tenantId: tenant.id,
          categoryId: atencionCategory.id,
          branchId: branchCentro.id,
          slug: 'orientacion-vecinal',
          name: 'Orientación vecinal',
          description:
            'Atención guiada para derivaciones, orientación y consultas generales.',
          durationMinutes: 30,
          bufferBeforeMinutes: 0,
          bufferAfterMinutes: 0,
          slotCapacity: 2,
          allowOnlineBooking: true,
          requiresApproval: false,
          requiresAuthentication: false,
          allowsCancellation: true,
          allowsReschedule: true,
          isActive: true,
        },
      }),
    ]);

  const rulesCreated = await createAvailabilityRules(prisma, {
    tenantId: tenant.id,
    branchCentroId: branchCentro.id,
    branchNorteId: branchNorte.id,
    serviceTeoricaId: serviceTeorica.id,
    servicePracticaId: servicePractica.id,
    servicePsicotecnicoId: servicePsicotecnico.id,
    serviceRenovacionId: serviceRenovacion.id,
    serviceOrientacionId: serviceOrientacion.id,
    centroOperatorId: centroOperator.id,
    norteOperatorId: norteOperator.id,
  });

  const generationFromDate = formatDateOnly(new Date());
  const generationToDate = formatDateOnly(
    addDays(new Date(), SLOT_GENERATION_FUTURE_DAYS - 1),
  );
  const slotGenerationSummary = await slotGenerationService.generateSlotsForTenant(
    tenant.id,
    generationFromDate,
    generationToDate,
  );

  await prisma.timeSlot.updateMany({
    where: {
      tenantId: tenant.id,
      serviceId: servicePractica.id,
    },
    data: {
      isPublic: false,
    },
  });

  const historicalSlots = await createHistoricalSlots(prisma, {
    tenantId: tenant.id,
    branchCentroId: branchCentro.id,
    branchNorteId: branchNorte.id,
    serviceTeoricaId: serviceTeorica.id,
    servicePracticaId: servicePractica.id,
    servicePsicotecnicoId: servicePsicotecnico.id,
    serviceRenovacionId: serviceRenovacion.id,
    serviceOrientacionId: serviceOrientacion.id,
    centroOperatorId: centroOperator.id,
    norteOperatorId: norteOperator.id,
  });

  const citizens = await createCitizens(prisma, tenant.id);

  const generatedSlots = await prisma.timeSlot.findMany({
    where: {
      tenantId: tenant.id,
      availabilityRuleId: {
        not: null,
      },
      startsAt: {
        gte: new Date(),
      },
    },
    orderBy: [{ startsAt: 'asc' }, { serviceId: 'asc' }],
  });

  const claimedSlotIds = new Set<string>();
  const pendingTheorySlot = claimSlot(
    'pending theory appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === serviceTeorica.id,
  );
  const pendingRenewalSlot = claimSlot(
    'pending renewal appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === serviceRenovacion.id,
  );
  const pendingOrientationSlot = claimSlot(
    'pending orientation appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === serviceOrientacion.id,
  );
  const pendingPsychotechnicalSlot = claimSlot(
    'pending psychotechnical appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === servicePsicotecnico.id,
  );
  const confirmedPsychoSlot = claimSlot(
    'confirmed psychotechnical appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === servicePsicotecnico.id,
  );
  const confirmedPracticalSlot = claimSlot(
    'confirmed practical appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === servicePractica.id,
  );
  const confirmedRenewalSlot = claimSlot(
    'confirmed renewal appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === serviceRenovacion.id,
  );
  const confirmedOrientationSlot = claimSlot(
    'confirmed orientation appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === serviceOrientacion.id,
  );
  const confirmedTheorySlot = claimSlot(
    'confirmed theory appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === serviceTeorica.id,
  );
  const cancelledPracticalSlot = claimSlot(
    'cancelled practical appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === servicePractica.id,
  );
  const cancelledOrientationSlot = claimSlot(
    'cancelled orientation appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === serviceOrientacion.id,
  );
  const rescheduleFromSlot = claimSlot(
    'reschedule origin slot',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === serviceTeorica.id,
  );
  const rescheduleToSlot = claimSlot(
    'reschedule target slot',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === serviceTeorica.id,
  );

  const appointmentsCreated = await createDemoAppointments(prisma, {
    tenantId: tenant.id,
    tenantAdminId: tenantAdmin.id,
    centroOperatorId: centroOperator.id,
    norteOperatorId: norteOperator.id,
    services: {
      teorica: serviceTeorica,
      practica: servicePractica,
      psicotecnico: servicePsicotecnico,
      renovacion: serviceRenovacion,
      orientacion: serviceOrientacion,
    },
    branches: {
      centro: branchCentro,
      norte: branchNorte,
    },
    citizens,
    slots: {
      pendingTheory: pendingTheorySlot,
      pendingRenewal: pendingRenewalSlot,
      pendingOrientation: pendingOrientationSlot,
      pendingPsychotechnical: pendingPsychotechnicalSlot,
      confirmedPsychotechnical: confirmedPsychoSlot,
      confirmedPractical: confirmedPracticalSlot,
      confirmedRenewal: confirmedRenewalSlot,
      confirmedOrientation: confirmedOrientationSlot,
      confirmedTheory: confirmedTheorySlot,
      cancelledPractical: cancelledPracticalSlot,
      cancelledOrientation: cancelledOrientationSlot,
      rescheduleFrom: rescheduleFromSlot,
      rescheduleTo: rescheduleToSlot,
      completedTheoryHistorical: historicalSlots.completedTheory,
      completedRenewalHistorical: historicalSlots.completedRenewal,
      completedOrientationHistorical: historicalSlots.completedOrientation,
      noShowPracticalHistorical: historicalSlots.noShowPractical,
      noShowPsychotechnicalHistorical: historicalSlots.noShowPsychotechnical,
      liveInProgress: historicalSlots.liveInProgress,
      checkedInOrientation: historicalSlots.checkedInOrientation,
    },
  });

  await syncSlotCountersAndStatuses(prisma, tenant.id);

  const totalSlotsCreated = await prisma.timeSlot.count({
    where: {
      tenantId: tenant.id,
    },
  });

  return {
    tenantSlug: tenant.slug,
    branchesCreated: 2,
    servicesCreated: 5,
    staffUsersCreated: 3,
    citizensCreated: citizens.length,
    rulesCreated,
    generatedSlotsCreated: slotGenerationSummary.createdCount,
    generatedSlotsSkipped: slotGenerationSummary.skippedCount,
    totalSlotsCreated,
    appointmentsCreated: appointmentsCreated.count,
    demoCodes: appointmentsCreated.codes,
    credentials: [
      {
        label: 'Tenant admin',
        email: tenantAdmin.email,
        password: DEFAULT_PASSWORD,
        role: tenantAdmin.role,
      },
      {
        label: 'Centro operator',
        email: centroOperator.email,
        password: DEFAULT_PASSWORD,
        role: centroOperator.role,
      },
      {
        label: 'Norte operator',
        email: norteOperator.email,
        password: DEFAULT_PASSWORD,
        role: norteOperator.role,
      },
    ],
  };
}

async function removeExistingDemoTenants(prisma: PrismaService) {
  await prisma.tenant.deleteMany({
    where: {
      slug: {
        in: [DEMO_TENANT_SLUG, LEGACY_DEMO_TENANT_SLUG],
      },
    },
  });
}

async function createAvailabilityRules(
  prisma: PrismaService,
  input: {
    tenantId: string;
    branchCentroId: string;
    branchNorteId: string;
    serviceTeoricaId: string;
    servicePracticaId: string;
    servicePsicotecnicoId: string;
    serviceRenovacionId: string;
    serviceOrientacionId: string;
    centroOperatorId: string;
    norteOperatorId: string;
  },
) {
  const businessWeek = [
    Weekday.MONDAY,
    Weekday.TUESDAY,
    Weekday.WEDNESDAY,
    Weekday.THURSDAY,
    Weekday.FRIDAY,
  ];

  const rulesData = [
    ...businessWeek.map((weekday) => ({
      tenantId: input.tenantId,
      branchId: input.branchCentroId,
      serviceId: input.serviceTeoricaId,
      staffUserId: input.centroOperatorId,
      weekday,
      startMinute: 9 * 60,
      endMinute: 12 * 60,
      slotDurationMinutes: 30,
      capacity: 1,
      isActive: true,
      notes: 'Bloque de evaluacion teorica de la manana.',
    })),
    ...businessWeek.map((weekday) => ({
      tenantId: input.tenantId,
      branchId: input.branchCentroId,
      serviceId: input.serviceTeoricaId,
      staffUserId: input.centroOperatorId,
      weekday,
      startMinute: 14 * 60,
      endMinute: 17 * 60,
      slotDurationMinutes: 30,
      capacity: 1,
      isActive: true,
      notes: 'Bloque de evaluacion teorica de la tarde.',
    })),
    [Weekday.MONDAY, Weekday.WEDNESDAY, Weekday.FRIDAY].map((weekday) => ({
      tenantId: input.tenantId,
      branchId: input.branchCentroId,
      serviceId: input.servicePracticaId,
      staffUserId: input.centroOperatorId,
      weekday,
      startMinute: 14 * 60,
      endMinute: 17 * 60,
      slotDurationMinutes: 45,
      capacity: 1,
      isActive: true,
      notes: 'Bloque de evaluacion practica supervisada.',
    })),
    [Weekday.TUESDAY, Weekday.THURSDAY].map((weekday) => ({
      tenantId: input.tenantId,
      branchId: input.branchNorteId,
      serviceId: input.servicePsicotecnicoId,
      staffUserId: input.norteOperatorId,
      weekday,
      startMinute: 10 * 60,
      endMinute: 13 * 60,
      slotDurationMinutes: 30,
      capacity: 2,
      isActive: true,
      notes: 'Ventana de evaluacion psicotecnica.',
    })),
    [Weekday.MONDAY, Weekday.WEDNESDAY, Weekday.FRIDAY].map((weekday) => ({
      tenantId: input.tenantId,
      branchId: input.branchNorteId,
      serviceId: input.serviceRenovacionId,
      staffUserId: input.norteOperatorId,
      weekday,
      startMinute: 9 * 60,
      endMinute: 12 * 60,
      slotDurationMinutes: 20,
      capacity: 2,
      isActive: true,
      notes: 'Bloques de renovacion express para flujo de alto volumen.',
    })),
    [Weekday.TUESDAY, Weekday.THURSDAY, Weekday.FRIDAY].map((weekday) => ({
      tenantId: input.tenantId,
      branchId: input.branchCentroId,
      serviceId: input.serviceOrientacionId,
      staffUserId: input.centroOperatorId,
      weekday,
      startMinute: 15 * 60,
      endMinute: 18 * 60,
      slotDurationMinutes: 30,
      capacity: 2,
      isActive: true,
      notes: 'Bloques de orientacion vecinal y derivaciones.',
    })),
  ].flat();

  for (const ruleData of rulesData) {
    await prisma.availabilityRule.create({
      data: ruleData,
    });
  }

  return rulesData.length;
}

async function createHistoricalSlots(
  prisma: PrismaService,
  input: {
    tenantId: string;
    branchCentroId: string;
    branchNorteId: string;
    serviceTeoricaId: string;
    servicePracticaId: string;
    servicePsicotecnicoId: string;
    serviceRenovacionId: string;
    serviceOrientacionId: string;
    centroOperatorId: string;
    norteOperatorId: string;
  },
) {
  const now = new Date();
  const yesterday = addDays(startOfUtcDay(now), -1);
  const twoDaysAgo = addDays(startOfUtcDay(now), -2);
  const threeDaysAgo = addDays(startOfUtcDay(now), -3);
  const liveStart = addMinutes(now, -15);
  const liveEnd = addMinutes(liveStart, 30);
  const checkedInStart = addMinutes(now, -5);
  const checkedInEnd = addMinutes(checkedInStart, 30);

  const completedTheory = await prisma.timeSlot.create({
    data: {
      tenantId: input.tenantId,
      branchId: input.branchCentroId,
      serviceId: input.serviceTeoricaId,
      staffUserId: input.centroOperatorId,
      slotDate: startOfUtcDay(yesterday),
      startsAt: setUtcTime(yesterday, 14, 0),
      endsAt: setUtcTime(yesterday, 14, 30),
      capacity: 1,
      reservedCount: 0,
      status: SlotStatus.OPEN,
      isPublic: true,
      notes: 'Historical completed slot for demo data.',
    },
  });

  const completedRenewal = await prisma.timeSlot.create({
    data: {
      tenantId: input.tenantId,
      branchId: input.branchNorteId,
      serviceId: input.serviceRenovacionId,
      staffUserId: input.norteOperatorId,
      slotDate: startOfUtcDay(yesterday),
      startsAt: setUtcTime(yesterday, 10, 0),
      endsAt: setUtcTime(yesterday, 10, 20),
      capacity: 2,
      reservedCount: 0,
      status: SlotStatus.OPEN,
      isPublic: true,
      notes: 'Historical completed renewal slot for demo data.',
    },
  });

  const completedOrientation = await prisma.timeSlot.create({
    data: {
      tenantId: input.tenantId,
      branchId: input.branchCentroId,
      serviceId: input.serviceOrientacionId,
      staffUserId: input.centroOperatorId,
      slotDate: startOfUtcDay(twoDaysAgo),
      startsAt: setUtcTime(twoDaysAgo, 15, 30),
      endsAt: setUtcTime(twoDaysAgo, 16, 0),
      capacity: 2,
      reservedCount: 0,
      status: SlotStatus.OPEN,
      isPublic: true,
      notes: 'Historical completed orientation slot for demo data.',
    },
  });

  const noShowPractical = await prisma.timeSlot.create({
    data: {
      tenantId: input.tenantId,
      branchId: input.branchCentroId,
      serviceId: input.servicePracticaId,
      staffUserId: input.centroOperatorId,
      slotDate: startOfUtcDay(twoDaysAgo),
      startsAt: setUtcTime(twoDaysAgo, 16, 0),
      endsAt: setUtcTime(twoDaysAgo, 16, 45),
      capacity: 1,
      reservedCount: 0,
      status: SlotStatus.OPEN,
      isPublic: false,
      notes: 'Historical no-show slot for demo data.',
    },
  });

  const noShowPsychotechnical = await prisma.timeSlot.create({
    data: {
      tenantId: input.tenantId,
      branchId: input.branchNorteId,
      serviceId: input.servicePsicotecnicoId,
      staffUserId: input.norteOperatorId,
      slotDate: startOfUtcDay(threeDaysAgo),
      startsAt: setUtcTime(threeDaysAgo, 11, 0),
      endsAt: setUtcTime(threeDaysAgo, 11, 30),
      capacity: 2,
      reservedCount: 0,
      status: SlotStatus.OPEN,
      isPublic: true,
      notes: 'Historical psychotechnical no-show slot for demo data.',
    },
  });

  const liveInProgress = await prisma.timeSlot.create({
    data: {
      tenantId: input.tenantId,
      branchId: input.branchCentroId,
      serviceId: input.serviceTeoricaId,
      staffUserId: input.centroOperatorId,
      slotDate: startOfUtcDay(now),
      startsAt: liveStart,
      endsAt: liveEnd,
      capacity: 1,
      reservedCount: 0,
      status: SlotStatus.OPEN,
      isPublic: true,
      notes: 'Live in-progress slot for dashboard demo.',
    },
  });

  const checkedInOrientation = await prisma.timeSlot.create({
    data: {
      tenantId: input.tenantId,
      branchId: input.branchCentroId,
      serviceId: input.serviceOrientacionId,
      staffUserId: input.centroOperatorId,
      slotDate: startOfUtcDay(now),
      startsAt: checkedInStart,
      endsAt: checkedInEnd,
      capacity: 2,
      reservedCount: 0,
      status: SlotStatus.OPEN,
      isPublic: true,
      notes: 'Live checked-in orientation slot for dashboard demo.',
    },
  });

  return {
    completedTheory,
    completedRenewal,
    completedOrientation,
    noShowPractical,
    noShowPsychotechnical,
    liveInProgress,
    checkedInOrientation,
  };
}

async function createCitizens(prisma: PrismaService, tenantId: string) {
  const citizensSeed = [
    ['Ana', 'Gonzalez', 'ana.gonzalez@example.com', '+56911112222', 'RUT', '12.345.678-9'],
    ['Matias', 'Soto', 'matias.soto@example.com', '+56911112223', 'RUT', '15.234.567-8'],
    ['Paula', 'Vega', 'paula.vega@example.com', '+56911112224', 'RUT', '16.456.789-0'],
    ['Jorge', 'Paredes', 'jorge.paredes@example.com', '+56911112225', 'RUT', '17.567.890-1'],
    ['Camila', 'Munoz', 'camila.munoz@example.com', '+56911112226', 'RUT', '18.678.901-2'],
    ['Nicolas', 'Herrera', 'nicolas.herrera@example.com', '+56911112227', 'RUT', '19.789.012-3'],
    ['Fernanda', 'Diaz', null, '+56911112228', null, null],
    ['Roberto', 'Leiva', 'roberto.leiva@example.com', '+56911112229', 'RUT', '20.890.123-4'],
    ['Daniela', 'Araya', 'daniela.araya@example.com', '+56911112230', 'RUT', '21.901.234-5'],
    ['Sebastian', 'Navarro', 'sebastian.navarro@example.com', '+56911112231', 'RUT', '22.012.345-6'],
    ['Constanza', 'Olivares', 'constanza.olivares@example.com', '+56911112232', 'RUT', '23.123.456-7'],
    ['Felipe', 'Saez', 'felipe.saez@example.com', '+56911112233', 'RUT', '24.234.567-8'],
    ['Catalina', 'Mora', 'catalina.mora@example.com', '+56911112234', 'RUT', '25.345.678-9'],
    ['Ignacio', 'Bustos', 'ignacio.bustos@example.com', '+56911112235', 'RUT', '26.456.789-0'],
    ['Valeria', 'Contreras', 'valeria.contreras@example.com', '+56911112236', 'RUT', '27.567.890-1'],
    ['Hector', 'Salinas', 'hector.salinas@example.com', '+56911112237', 'RUT', '28.678.901-2'],
    ['Josefa', 'Torres', null, '+56911112238', null, null],
    ['Cristobal', 'Mella', 'cristobal.mella@example.com', '+56911112239', 'RUT', '29.789.012-3'],
    ['Francisca', 'Sepulveda', 'francisca.sepulveda@example.com', '+56911112240', 'RUT', '30.890.123-4'],
    ['Benjamin', 'Carrasco', 'benjamin.carrasco@example.com', '+56911112241', 'RUT', '31.901.234-5'],
  ] as const;

  const citizens: Array<{ id: string }> = [];

  for (const citizen of citizensSeed) {
    const createdCitizen = await prisma.citizen.create({
      data: {
        tenantId,
        firstName: citizen[0],
        lastName: citizen[1],
        email: citizen[2],
        phone: citizen[3],
        documentType: citizen[4],
        documentNumber: citizen[5],
        isActive: true,
      },
    });

    citizens.push({ id: createdCitizen.id });
  }

  return citizens;
}

async function createDemoAppointments(
  prisma: PrismaService,
  input: {
    tenantId: string;
    tenantAdminId: string;
    centroOperatorId: string;
    norteOperatorId: string;
    services: {
      teorica: { id: string; name: string; branchId: string | null };
      practica: { id: string; name: string; branchId: string | null };
      psicotecnico: { id: string; name: string; branchId: string | null };
      renovacion: { id: string; name: string; branchId: string | null };
      orientacion: { id: string; name: string; branchId: string | null };
    };
    branches: {
      centro: { id: string };
      norte: { id: string };
    };
    citizens: Array<{ id: string }>;
    slots: {
      pendingTheory: DemoSlot;
      pendingRenewal: DemoSlot;
      pendingOrientation: DemoSlot;
      pendingPsychotechnical: DemoSlot;
      confirmedPsychotechnical: DemoSlot;
      confirmedPractical: DemoSlot;
      confirmedRenewal: DemoSlot;
      confirmedOrientation: DemoSlot;
      confirmedTheory: DemoSlot;
      cancelledPractical: DemoSlot;
      cancelledOrientation: DemoSlot;
      rescheduleFrom: DemoSlot;
      rescheduleTo: DemoSlot;
      completedTheoryHistorical: DemoSlot;
      completedRenewalHistorical: DemoSlot;
      completedOrientationHistorical: DemoSlot;
      noShowPracticalHistorical: DemoSlot;
      noShowPsychotechnicalHistorical: DemoSlot;
      liveInProgress: DemoSlot;
      checkedInOrientation: DemoSlot;
    };
  },
) {
  const now = new Date();
  const historyRows: Prisma.AppointmentStatusHistoryCreateManyInput[] = [];
  const cancellationRows: Prisma.AppointmentCancellationCreateManyInput[] = [];
  const rescheduleRows: Prisma.AppointmentRescheduleCreateManyInput[] = [];
  const codes: string[] = [];

  const createSingleStatusSeed = (options: {
    code: string;
    branchId: string;
    serviceId: string;
    citizenId: string;
    staffUserId: string | null;
    slot: DemoSlot;
    source: AppointmentSource;
    status: AppointmentStatus;
    citizenNotes: string | null;
    internalNotes: string | null;
    createdAt: Date;
    note: string;
    changedByStaffUserId: string | null;
    metadata?: Prisma.InputJsonValue | null;
    historyChangedAt?: Date;
  }): DemoAppointmentSeed => ({
    code: options.code,
    branchId: options.branchId,
    serviceId: options.serviceId,
    citizenId: options.citizenId,
    staffUserId: options.staffUserId,
    slot: options.slot,
    source: options.source,
    status: options.status,
    citizenNotes: options.citizenNotes,
    internalNotes: options.internalNotes,
    createdAt: options.createdAt,
    updatedAt: options.historyChangedAt ?? options.createdAt,
    statusHistory: [
      {
        fromStatus: null,
        toStatus: options.status,
        note: options.note,
        metadata: options.metadata ?? { source: options.source },
        changedByStaffUserId: options.changedByStaffUserId,
        changedAt: options.historyChangedAt ?? options.createdAt,
      },
    ],
  });

  const createCancelledSeed = (options: {
    code: string;
    branchId: string;
    serviceId: string;
    citizenId: string;
    staffUserId: string | null;
    slot: DemoSlot;
    source: AppointmentSource;
    citizenNotes: string | null;
    internalNotes: string | null;
    createdAt: Date;
    confirmedNote: string;
    confirmedByStaffUserId: string | null;
    cancelledAt: Date;
    cancelledByStaffUserId: string | null;
    cancellationReason: string;
    cancellationDetails: string | null;
  }): DemoAppointmentSeed => {
    const confirmedSeed = createSingleStatusSeed({
      code: options.code,
      branchId: options.branchId,
      serviceId: options.serviceId,
      citizenId: options.citizenId,
      staffUserId: options.staffUserId,
      slot: options.slot,
      source: options.source,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: options.citizenNotes,
      internalNotes: options.internalNotes,
      createdAt: options.createdAt,
      note: options.confirmedNote,
      changedByStaffUserId: options.confirmedByStaffUserId,
    });

    return {
      ...confirmedSeed,
      status: AppointmentStatus.CANCELLED,
      cancelledAt: options.cancelledAt,
      updatedAt: options.cancelledAt,
      statusHistory: [
        ...confirmedSeed.statusHistory,
        {
          fromStatus: AppointmentStatus.CONFIRMED,
          toStatus: AppointmentStatus.CANCELLED,
          note: 'Appointment cancelled before the visit.',
          metadata: null,
          changedByStaffUserId: options.cancelledByStaffUserId,
          changedAt: options.cancelledAt,
        },
      ],
      cancellation: {
        cancelledByStaffUserId: options.cancelledByStaffUserId,
        reason: options.cancellationReason,
        details: options.cancellationDetails,
        cancelledAt: options.cancelledAt,
      },
    };
  };

  const createNoShowSeed = (options: {
    code: string;
    branchId: string;
    serviceId: string;
    citizenId: string;
    staffUserId: string | null;
    slot: DemoSlot;
    source: AppointmentSource;
    citizenNotes: string | null;
    internalNotes: string | null;
    createdAt: Date;
    confirmedNote: string;
    confirmedByStaffUserId: string | null;
    noShowAt: Date;
    noShowByStaffUserId: string | null;
  }): DemoAppointmentSeed => {
    const confirmedSeed = createSingleStatusSeed({
      code: options.code,
      branchId: options.branchId,
      serviceId: options.serviceId,
      citizenId: options.citizenId,
      staffUserId: options.staffUserId,
      slot: options.slot,
      source: options.source,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: options.citizenNotes,
      internalNotes: options.internalNotes,
      createdAt: options.createdAt,
      note: options.confirmedNote,
      changedByStaffUserId: options.confirmedByStaffUserId,
    });

    return {
      ...confirmedSeed,
      status: AppointmentStatus.NO_SHOW,
      updatedAt: options.noShowAt,
      statusHistory: [
        ...confirmedSeed.statusHistory,
        {
          fromStatus: AppointmentStatus.CONFIRMED,
          toStatus: AppointmentStatus.NO_SHOW,
          note: 'Citizen did not arrive for the appointment.',
          metadata: null,
          changedByStaffUserId: options.noShowByStaffUserId,
          changedAt: options.noShowAt,
        },
      ],
    };
  };

  const createCheckedInSeed = (options: {
    code: string;
    branchId: string;
    serviceId: string;
    citizenId: string;
    staffUserId: string | null;
    slot: DemoSlot;
    source: AppointmentSource;
    citizenNotes: string | null;
    internalNotes: string | null;
    createdAt: Date;
    confirmedNote: string;
    confirmedByStaffUserId: string | null;
    checkedInAt: Date;
    checkedInByStaffUserId: string | null;
  }): DemoAppointmentSeed => {
    const confirmedSeed = createSingleStatusSeed({
      code: options.code,
      branchId: options.branchId,
      serviceId: options.serviceId,
      citizenId: options.citizenId,
      staffUserId: options.staffUserId,
      slot: options.slot,
      source: options.source,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: options.citizenNotes,
      internalNotes: options.internalNotes,
      createdAt: options.createdAt,
      note: options.confirmedNote,
      changedByStaffUserId: options.confirmedByStaffUserId,
    });

    return {
      ...confirmedSeed,
      status: AppointmentStatus.CHECKED_IN,
      checkedInAt: options.checkedInAt,
      updatedAt: options.checkedInAt,
      statusHistory: [
        ...confirmedSeed.statusHistory,
        {
          fromStatus: AppointmentStatus.CONFIRMED,
          toStatus: AppointmentStatus.CHECKED_IN,
          note: 'Citizen completed the front-desk check-in.',
          metadata: null,
          changedByStaffUserId: options.checkedInByStaffUserId,
          changedAt: options.checkedInAt,
        },
      ],
    };
  };

  const createInProgressSeed = (options: {
    code: string;
    branchId: string;
    serviceId: string;
    citizenId: string;
    staffUserId: string | null;
    slot: DemoSlot;
    source: AppointmentSource;
    citizenNotes: string | null;
    internalNotes: string | null;
    createdAt: Date;
    confirmedNote: string;
    confirmedByStaffUserId: string | null;
    checkedInAt: Date;
    inProgressAt: Date;
    handledByStaffUserId: string | null;
  }): DemoAppointmentSeed => {
    const checkedInSeed = createCheckedInSeed({
      code: options.code,
      branchId: options.branchId,
      serviceId: options.serviceId,
      citizenId: options.citizenId,
      staffUserId: options.staffUserId,
      slot: options.slot,
      source: options.source,
      citizenNotes: options.citizenNotes,
      internalNotes: options.internalNotes,
      createdAt: options.createdAt,
      confirmedNote: options.confirmedNote,
      confirmedByStaffUserId: options.confirmedByStaffUserId,
      checkedInAt: options.checkedInAt,
      checkedInByStaffUserId: options.handledByStaffUserId,
    });

    return {
      ...checkedInSeed,
      status: AppointmentStatus.IN_PROGRESS,
      updatedAt: options.inProgressAt,
      statusHistory: [
        ...checkedInSeed.statusHistory,
        {
          fromStatus: AppointmentStatus.CHECKED_IN,
          toStatus: AppointmentStatus.IN_PROGRESS,
          note: 'Advisor started the attention process.',
          metadata: null,
          changedByStaffUserId: options.handledByStaffUserId,
          changedAt: options.inProgressAt,
        },
      ],
    };
  };

  const createCompletedSeed = (options: {
    code: string;
    branchId: string;
    serviceId: string;
    citizenId: string;
    staffUserId: string | null;
    slot: DemoSlot;
    source: AppointmentSource;
    citizenNotes: string | null;
    internalNotes: string | null;
    createdAt: Date;
    confirmedNote: string;
    confirmedByStaffUserId: string | null;
    checkedInAt: Date;
    inProgressAt: Date;
    completedAt: Date;
    handledByStaffUserId: string | null;
  }): DemoAppointmentSeed => {
    const inProgressSeed = createInProgressSeed({
      code: options.code,
      branchId: options.branchId,
      serviceId: options.serviceId,
      citizenId: options.citizenId,
      staffUserId: options.staffUserId,
      slot: options.slot,
      source: options.source,
      citizenNotes: options.citizenNotes,
      internalNotes: options.internalNotes,
      createdAt: options.createdAt,
      confirmedNote: options.confirmedNote,
      confirmedByStaffUserId: options.confirmedByStaffUserId,
      checkedInAt: options.checkedInAt,
      inProgressAt: options.inProgressAt,
      handledByStaffUserId: options.handledByStaffUserId,
    });

    return {
      ...inProgressSeed,
      status: AppointmentStatus.COMPLETED,
      completedAt: options.completedAt,
      updatedAt: options.completedAt,
      statusHistory: [
        ...inProgressSeed.statusHistory,
        {
          fromStatus: AppointmentStatus.IN_PROGRESS,
          toStatus: AppointmentStatus.COMPLETED,
          note: 'Appointment completed successfully.',
          metadata: null,
          changedByStaffUserId: options.handledByStaffUserId,
          changedAt: options.completedAt,
        },
      ],
    };
  };

  const createRescheduledSeed = (options: {
    code: string;
    branchId: string;
    serviceId: string;
    citizenId: string;
    staffUserId: string | null;
    slot: DemoSlot;
    source: AppointmentSource;
    citizenNotes: string | null;
    internalNotes: string | null;
    createdAt: Date;
    confirmedNote: string;
    confirmedByStaffUserId: string | null;
    rescheduledAt: Date;
    rescheduledByStaffUserId: string | null;
    fromSlot: DemoSlot;
    reason: string;
  }): DemoAppointmentSeed => {
    const confirmedSeed = createSingleStatusSeed({
      code: options.code,
      branchId: options.branchId,
      serviceId: options.serviceId,
      citizenId: options.citizenId,
      staffUserId: options.staffUserId,
      slot: options.slot,
      source: options.source,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: options.citizenNotes,
      internalNotes: options.internalNotes,
      createdAt: options.createdAt,
      note: options.confirmedNote,
      changedByStaffUserId: options.confirmedByStaffUserId,
    });

    return {
      ...confirmedSeed,
      updatedAt: options.rescheduledAt,
      statusHistory: [
        ...confirmedSeed.statusHistory,
        {
          fromStatus: AppointmentStatus.CONFIRMED,
          toStatus: AppointmentStatus.CONFIRMED,
          note: 'Appointment rescheduled to a different future slot.',
          metadata: {
            event: 'rescheduled',
            fromSlotId: options.fromSlot.id,
            toSlotId: options.slot.id,
          },
          changedByStaffUserId: options.rescheduledByStaffUserId,
          changedAt: options.rescheduledAt,
        },
      ],
      reschedule: {
        fromSlotId: options.fromSlot.id,
        toSlotId: options.slot.id,
        rescheduledByStaffUserId: options.rescheduledByStaffUserId,
        previousStart: options.fromSlot.startsAt,
        previousEnd: options.fromSlot.endsAt,
        nextStart: options.slot.startsAt,
        nextEnd: options.slot.endsAt,
        reason: options.reason,
        createdAt: options.rescheduledAt,
      },
    };
  };

  const appointmentPlan: DemoAppointmentSeed[] = [
    createSingleStatusSeed({
      code: 'APT-DEMO-PENDING-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.teorica.id,
      citizenId: input.citizens[0]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.pendingTheory,
      source: AppointmentSource.WEB,
      status: AppointmentStatus.PENDING,
      citizenNotes: 'Traer cedula vigente y comprobante de reserva.',
      internalNotes: null,
      createdAt: addDays(now, -3),
      note: 'Appointment created from public booking.',
      changedByStaffUserId: null,
    }),
    createSingleStatusSeed({
      code: 'APT-DEMO-PENDING-002',
      branchId: input.branches.norte.id,
      serviceId: input.services.renovacion.id,
      citizenId: input.citizens[1]!.id,
      staffUserId: input.norteOperatorId,
      slot: input.slots.pendingRenewal,
      source: AppointmentSource.WEB,
      status: AppointmentStatus.PENDING,
      citizenNotes: 'Desea confirmar si puede adelantar documentacion por correo.',
      internalNotes: null,
      createdAt: addDays(now, -2),
      note: 'Appointment created awaiting branch validation.',
      changedByStaffUserId: null,
    }),
    createSingleStatusSeed({
      code: 'APT-DEMO-PENDING-003',
      branchId: input.branches.centro.id,
      serviceId: input.services.orientacion.id,
      citizenId: input.citizens[2]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.pendingOrientation,
      source: AppointmentSource.WEB,
      status: AppointmentStatus.PENDING,
      citizenNotes: 'Solicita informacion sobre requisitos adicionales.',
      internalNotes: null,
      createdAt: addDays(now, -2),
      note: 'Appointment created from public orientation form.',
      changedByStaffUserId: null,
    }),
    createSingleStatusSeed({
      code: 'APT-DEMO-PENDING-004',
      branchId: input.branches.norte.id,
      serviceId: input.services.psicotecnico.id,
      citizenId: input.citizens[3]!.id,
      staffUserId: input.norteOperatorId,
      slot: input.slots.pendingPsychotechnical,
      source: AppointmentSource.WEB,
      status: AppointmentStatus.PENDING,
      citizenNotes: 'Prefiere recibir recordatorio por telefono.',
      internalNotes: null,
      createdAt: addDays(now, -1),
      note: 'Appointment pending confirmation after public booking.',
      changedByStaffUserId: null,
    }),
    createSingleStatusSeed({
      code: 'APT-DEMO-CONFIRM-001',
      branchId: input.branches.norte.id,
      serviceId: input.services.psicotecnico.id,
      citizenId: input.citizens[4]!.id,
      staffUserId: input.norteOperatorId,
      slot: input.slots.confirmedPsychotechnical,
      source: AppointmentSource.WEB,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: 'Solicita confirmacion por correo.',
      internalNotes: 'Aprobada para flujo publico.',
      createdAt: addDays(now, -2),
      note: 'Appointment confirmed after public booking review.',
      changedByStaffUserId: input.norteOperatorId,
    }),
    createSingleStatusSeed({
      code: 'APT-DEMO-CONFIRM-002',
      branchId: input.branches.centro.id,
      serviceId: input.services.practica.id,
      citizenId: input.citizens[5]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.confirmedPractical,
      source: AppointmentSource.STAFF,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: null,
      internalNotes: 'Confirmada por operador desde backoffice.',
      createdAt: addDays(now, -1),
      note: 'Appointment created by branch operator.',
      changedByStaffUserId: input.centroOperatorId,
    }),
    createSingleStatusSeed({
      code: 'APT-DEMO-CONFIRM-003',
      branchId: input.branches.norte.id,
      serviceId: input.services.renovacion.id,
      citizenId: input.citizens[6]!.id,
      staffUserId: input.norteOperatorId,
      slot: input.slots.confirmedRenewal,
      source: AppointmentSource.STAFF,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: 'Traera licencia vencida y comprobante de domicilio.',
      internalNotes: 'Agendada por mesa de ayuda interna.',
      createdAt: addDays(now, -1),
      note: 'Appointment created directly by support staff.',
      changedByStaffUserId: input.norteOperatorId,
    }),
    createSingleStatusSeed({
      code: 'APT-DEMO-CONFIRM-004',
      branchId: input.branches.centro.id,
      serviceId: input.services.orientacion.id,
      citizenId: input.citizens[7]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.confirmedOrientation,
      source: AppointmentSource.WEB,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: 'Consulta por orientacion de tramites vecinales.',
      internalNotes: 'Confirmada por equipo de atencion ciudadana.',
      createdAt: addDays(now, -1),
      note: 'Appointment confirmed after internal review.',
      changedByStaffUserId: input.centroOperatorId,
    }),
    createSingleStatusSeed({
      code: 'APT-DEMO-CONFIRM-005',
      branchId: input.branches.centro.id,
      serviceId: input.services.teorica.id,
      citizenId: input.citizens[8]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.confirmedTheory,
      source: AppointmentSource.STAFF,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: null,
      internalNotes: 'Reserva tomada por call center municipal.',
      createdAt: addDays(now, -1),
      note: 'Appointment scheduled by a municipal operator.',
      changedByStaffUserId: input.centroOperatorId,
    }),
    createRescheduledSeed({
      code: 'APT-DEMO-RESCHED-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.teorica.id,
      citizenId: input.citizens[9]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.rescheduleTo,
      source: AppointmentSource.WEB,
      citizenNotes: 'Prefiere bloque de media manana.',
      internalNotes: 'Caso demo con reagendamiento.',
      createdAt: addDays(now, -6),
      confirmedNote: 'Appointment confirmed from public booking.',
      confirmedByStaffUserId: null,
      rescheduledAt: addDays(now, -1),
      rescheduledByStaffUserId: input.tenantAdminId,
      fromSlot: input.slots.rescheduleFrom,
      reason: 'Citizen requested a later arrival time.',
    }),
    createInProgressSeed({
      code: 'APT-DEMO-LIVE-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.teorica.id,
      citizenId: input.citizens[10]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.liveInProgress,
      source: AppointmentSource.STAFF,
      citizenNotes: 'Revision prioritaria por vencimiento cercano.',
      internalNotes: 'Atencion en curso para dashboard en vivo.',
      createdAt: addHours(now, -3),
      confirmedNote: 'Appointment created by backoffice operator.',
      confirmedByStaffUserId: input.centroOperatorId,
      checkedInAt: addMinutes(input.slots.liveInProgress.startsAt, -10),
      inProgressAt: addMinutes(input.slots.liveInProgress.startsAt, 5),
      handledByStaffUserId: input.centroOperatorId,
    }),
    createCheckedInSeed({
      code: 'APT-DEMO-CHECKIN-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.orientacion.id,
      citizenId: input.citizens[11]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.checkedInOrientation,
      source: AppointmentSource.STAFF,
      citizenNotes: 'Necesita orientacion para carpeta de antecedentes.',
      internalNotes: 'Esperando derivacion con asistente social.',
      createdAt: addHours(now, -4),
      confirmedNote: 'Appointment booked by internal customer support.',
      confirmedByStaffUserId: input.centroOperatorId,
      checkedInAt: addMinutes(input.slots.checkedInOrientation.startsAt, -10),
      checkedInByStaffUserId: input.centroOperatorId,
    }),
    createCompletedSeed({
      code: 'APT-DEMO-COMPLETE-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.teorica.id,
      citizenId: input.citizens[12]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.completedTheoryHistorical,
      source: AppointmentSource.STAFF,
      citizenNotes: null,
      internalNotes: 'Documentacion validada sin observaciones.',
      createdAt: addDays(now, -7),
      confirmedNote: 'Appointment created by operator.',
      confirmedByStaffUserId: input.centroOperatorId,
      checkedInAt: addMinutes(input.slots.completedTheoryHistorical.startsAt, -10),
      inProgressAt: input.slots.completedTheoryHistorical.startsAt,
      completedAt: input.slots.completedTheoryHistorical.endsAt,
      handledByStaffUserId: input.centroOperatorId,
    }),
    createCompletedSeed({
      code: 'APT-DEMO-COMPLETE-002',
      branchId: input.branches.norte.id,
      serviceId: input.services.renovacion.id,
      citizenId: input.citizens[13]!.id,
      staffUserId: input.norteOperatorId,
      slot: input.slots.completedRenewalHistorical,
      source: AppointmentSource.WEB,
      citizenNotes: 'Renovacion completada con toda la documentacion.',
      internalNotes: 'Caso demo para metricas de renovacion.',
      createdAt: addDays(now, -6),
      confirmedNote: 'Appointment confirmed from assisted web booking.',
      confirmedByStaffUserId: input.norteOperatorId,
      checkedInAt: addMinutes(input.slots.completedRenewalHistorical.startsAt, -10),
      inProgressAt: input.slots.completedRenewalHistorical.startsAt,
      completedAt: input.slots.completedRenewalHistorical.endsAt,
      handledByStaffUserId: input.norteOperatorId,
    }),
    createCompletedSeed({
      code: 'APT-DEMO-COMPLETE-003',
      branchId: input.branches.centro.id,
      serviceId: input.services.orientacion.id,
      citizenId: input.citizens[14]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.completedOrientationHistorical,
      source: AppointmentSource.WEB,
      citizenNotes: 'Solicito orientacion para derivacion social.',
      internalNotes: 'Atencion resuelta con entrega de documentos.',
      createdAt: addDays(now, -5),
      confirmedNote: 'Appointment confirmed after public request review.',
      confirmedByStaffUserId: input.centroOperatorId,
      checkedInAt: addMinutes(
        input.slots.completedOrientationHistorical.startsAt,
        -10,
      ),
      inProgressAt: input.slots.completedOrientationHistorical.startsAt,
      completedAt: input.slots.completedOrientationHistorical.endsAt,
      handledByStaffUserId: input.centroOperatorId,
    }),
    createCancelledSeed({
      code: 'APT-DEMO-CANCEL-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.practica.id,
      citizenId: input.citizens[15]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.cancelledPractical,
      source: AppointmentSource.STAFF,
      citizenNotes: 'Solicita nueva fecha por viaje.',
      internalNotes: 'Demostracion de cancelacion con liberacion de cupo.',
      createdAt: addDays(now, -4),
      confirmedNote: 'Appointment created by branch operator.',
      confirmedByStaffUserId: input.centroOperatorId,
      cancelledAt: addDays(now, -1),
      cancelledByStaffUserId: input.centroOperatorId,
      cancellationReason: 'Citizen requested cancellation',
      cancellationDetails:
        'Citizen called to ask for a later booking during the next week.',
    }),
    createCancelledSeed({
      code: 'APT-DEMO-CANCEL-002',
      branchId: input.branches.centro.id,
      serviceId: input.services.orientacion.id,
      citizenId: input.citizens[16]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.cancelledOrientation,
      source: AppointmentSource.WEB,
      citizenNotes: 'No podra asistir por tema laboral.',
      internalNotes: 'Cancelada desde el portal ciudadano.',
      createdAt: addDays(now, -3),
      confirmedNote: 'Appointment confirmed from public booking.',
      confirmedByStaffUserId: null,
      cancelledAt: addHours(now, -12),
      cancelledByStaffUserId: null,
      cancellationReason: 'Citizen requested cancellation from public portal',
      cancellationDetails: 'Needs a different week due to work schedule changes.',
    }),
    createNoShowSeed({
      code: 'APT-DEMO-NOSHOW-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.practica.id,
      citizenId: input.citizens[17]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.noShowPracticalHistorical,
      source: AppointmentSource.WEB,
      citizenNotes: null,
      internalNotes: 'No se presento al bloque asignado.',
      createdAt: addDays(now, -8),
      confirmedNote: 'Appointment confirmed from web booking.',
      confirmedByStaffUserId: null,
      noShowAt: addHours(input.slots.noShowPracticalHistorical.endsAt, 1),
      noShowByStaffUserId: input.centroOperatorId,
    }),
    createNoShowSeed({
      code: 'APT-DEMO-NOSHOW-002',
      branchId: input.branches.norte.id,
      serviceId: input.services.psicotecnico.id,
      citizenId: input.citizens[18]!.id,
      staffUserId: input.norteOperatorId,
      slot: input.slots.noShowPsychotechnicalHistorical,
      source: AppointmentSource.WEB,
      citizenNotes: 'Solicito evaluacion matinal.',
      internalNotes: 'Caso demo de inasistencia en sede norte.',
      createdAt: addDays(now, -9),
      confirmedNote: 'Appointment confirmed after psychotechnical review.',
      confirmedByStaffUserId: input.norteOperatorId,
      noShowAt: addHours(input.slots.noShowPsychotechnicalHistorical.endsAt, 1),
      noShowByStaffUserId: input.norteOperatorId,
    }),
  ];

  for (const item of appointmentPlan) {
    const appointment = await prisma.appointment.create({
      data: {
        tenantId: input.tenantId,
        branchId: item.branchId,
        serviceId: item.serviceId,
        citizenId: item.citizenId,
        staffUserId: item.staffUserId,
        slotId: item.slot.id,
        code: item.code,
        source: item.source,
        status: item.status,
        scheduledStart: item.slot.startsAt,
        scheduledEnd: item.slot.endsAt,
        citizenNotes: item.citizenNotes,
        internalNotes: item.internalNotes,
        checkedInAt: item.checkedInAt ?? null,
        completedAt: item.completedAt ?? null,
        cancelledAt: item.cancelledAt ?? null,
        createdAt: item.createdAt,
        updatedAt:
          item.updatedAt ??
          item.completedAt ??
          item.cancelledAt ??
          item.checkedInAt ??
          item.createdAt,
      },
    });

    codes.push(appointment.code);

    historyRows.push(
      ...item.statusHistory.map((entry) => ({
        tenantId: input.tenantId,
        appointmentId: appointment.id,
        changedByStaffUserId: entry.changedByStaffUserId,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        note: entry.note,
        ...(entry.metadata !== null
          ? { metadata: entry.metadata as Prisma.InputJsonValue }
          : {}),
        changedAt: entry.changedAt,
      })),
    );

    if (item.cancellation) {
      cancellationRows.push({
        tenantId: input.tenantId,
        appointmentId: appointment.id,
        cancelledByStaffUserId: item.cancellation.cancelledByStaffUserId,
        reason: item.cancellation.reason,
        details: item.cancellation.details,
        cancelledAt: item.cancellation.cancelledAt,
      });
    }

    if (item.reschedule) {
      rescheduleRows.push({
        tenantId: input.tenantId,
        appointmentId: appointment.id,
        fromSlotId: item.reschedule.fromSlotId,
        toSlotId: item.reschedule.toSlotId,
        rescheduledByStaffUserId: item.reschedule.rescheduledByStaffUserId,
        previousStart: item.reschedule.previousStart,
        previousEnd: item.reschedule.previousEnd,
        nextStart: item.reschedule.nextStart,
        nextEnd: item.reschedule.nextEnd,
        reason: item.reschedule.reason,
        createdAt: item.reschedule.createdAt,
      });
    }
  }

  if (historyRows.length > 0) {
    await prisma.appointmentStatusHistory.createMany({
      data: historyRows,
    });
  }

  if (cancellationRows.length > 0) {
    await prisma.appointmentCancellation.createMany({
      data: cancellationRows,
    });
  }

  if (rescheduleRows.length > 0) {
    await prisma.appointmentReschedule.createMany({
      data: rescheduleRows,
    });
  }

  return {
    count: appointmentPlan.length,
    codes,
  };
}

async function syncSlotCountersAndStatuses(
  prisma: PrismaService,
  tenantId: string,
) {
  const [slots, appointmentCounts] = await Promise.all([
    prisma.timeSlot.findMany({
      where: {
        tenantId,
      },
      select: {
        id: true,
        capacity: true,
      },
    }),
    prisma.appointment.groupBy({
      by: ['slotId'],
      where: {
        tenantId,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const countBySlotId = new Map(
    appointmentCounts.map((item) => [item.slotId, item._count._all]),
  );

  await prisma.$transaction(
    slots.map((slot) =>
      prisma.timeSlot.update({
        where: {
          id: slot.id,
        },
        data: {
          reservedCount: countBySlotId.get(slot.id) ?? 0,
          status:
            (countBySlotId.get(slot.id) ?? 0) >= slot.capacity
              ? SlotStatus.FULL
              : SlotStatus.OPEN,
        },
      }),
    ),
  );
}

function claimSlot(
  label: string,
  slots: DemoSlot[],
  claimedSlotIds: Set<string>,
  predicate: (slot: DemoSlot) => boolean,
) {
  const slot = slots.find((candidate) => {
    if (claimedSlotIds.has(candidate.id)) {
      return false;
    }

    return predicate(candidate);
  });

  if (!slot) {
    throw new Error(`Unable to find a slot for "${label}" while seeding demo data.`);
  }

  claimedSlotIds.add(slot.id);

  return slot;
}

function logSummary(summary: SeedSummary) {
  const lines = [
    '',
    'Turnix demo seed completed successfully.',
    `Tenant: ${summary.tenantSlug}`,
    `Branches: ${summary.branchesCreated}`,
    `Services: ${summary.servicesCreated}`,
    `Staff users: ${summary.staffUsersCreated}`,
    `Citizens: ${summary.citizensCreated}`,
    `Availability rules: ${summary.rulesCreated}`,
    `Generated slots: ${summary.generatedSlotsCreated} created / ${summary.generatedSlotsSkipped} skipped`,
    `Total slots available in demo tenant: ${summary.totalSlotsCreated}`,
    `Appointments: ${summary.appointmentsCreated}`,
    `Demo appointment codes: ${summary.demoCodes.join(', ')}`,
    '',
    'Development credentials:',
    ...summary.credentials.map(
      (credential) =>
        `- ${credential.label}: ${credential.email} / ${credential.password} (${credential.role})`,
    ),
    '',
  ];

  console.log(lines.join('\n'));
}

function formatDateOnly(value: Date) {
  return startOfUtcDay(value).toISOString().slice(0, 10);
}

function startOfUtcDay(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
}

function addHours(value: Date, hours: number) {
  return new Date(value.getTime() + hours * 60 * 60 * 1000);
}

function addMinutes(value: Date, minutes: number) {
  return new Date(value.getTime() + minutes * 60 * 1000);
}

function setUtcTime(value: Date, hours: number, minutes: number) {
  const result = startOfUtcDay(value);
  result.setUTCHours(hours, minutes, 0, 0);

  return result;
}

type DemoSlot = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  branchId: string;
  serviceId: string;
  staffUserId: string | null;
};

type DemoAppointmentSeed = {
  code: string;
  branchId: string;
  serviceId: string;
  citizenId: string;
  staffUserId: string | null;
  slot: DemoSlot;
  source: AppointmentSource;
  status: AppointmentStatus;
  citizenNotes: string | null;
  internalNotes: string | null;
  createdAt: Date;
  updatedAt?: Date;
  checkedInAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  statusHistory: Array<{
    fromStatus: AppointmentStatus | null;
    toStatus: AppointmentStatus;
    note: string | null;
    metadata: Prisma.InputJsonValue | null;
    changedByStaffUserId: string | null;
    changedAt: Date;
  }>;
  cancellation?: {
    cancelledByStaffUserId: string | null;
    reason: string | null;
    details: string | null;
    cancelledAt: Date;
  };
  reschedule?: {
    fromSlotId: string;
    toSlotId: string;
    rescheduledByStaffUserId: string | null;
    previousStart: Date;
    previousEnd: Date;
    nextStart: Date;
    nextEnd: Date;
    reason: string | null;
    createdAt: Date;
  };
};

main().catch((error) => {
  console.error('Prisma seed failed.', error);
  process.exitCode = 1;
});
