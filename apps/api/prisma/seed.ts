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
const SLOT_GENERATION_FUTURE_DAYS = 14;

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

  const [licenciasCategory, evaluacionesCategory] = await Promise.all([
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

  const [serviceTeorica, servicePractica, servicePsicotecnico] =
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
    ]);

  const rulesCreated = await createAvailabilityRules(prisma, {
    tenantId: tenant.id,
    branchCentroId: branchCentro.id,
    branchNorteId: branchNorte.id,
    serviceTeoricaId: serviceTeorica.id,
    servicePracticaId: servicePractica.id,
    servicePsicotecnicoId: servicePsicotecnico.id,
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
    serviceTeoricaId: serviceTeorica.id,
    servicePracticaId: servicePractica.id,
    centroOperatorId: centroOperator.id,
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
  const cancelledPracticalSlot = claimSlot(
    'cancelled practical appointment',
    generatedSlots,
    claimedSlotIds,
    (slot) => slot.serviceId === servicePractica.id,
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
    },
    branches: {
      centro: branchCentro,
      norte: branchNorte,
    },
    citizens,
    slots: {
      pendingTheory: pendingTheorySlot,
      confirmedPsychotechnical: confirmedPsychoSlot,
      confirmedPractical: confirmedPracticalSlot,
      cancelledPractical: cancelledPracticalSlot,
      rescheduleFrom: rescheduleFromSlot,
      rescheduleTo: rescheduleToSlot,
      completedHistorical: historicalSlots.completed,
      noShowHistorical: historicalSlots.noShow,
      liveInProgress: historicalSlots.liveInProgress,
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
    servicesCreated: 3,
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
    serviceTeoricaId: string;
    servicePracticaId: string;
    centroOperatorId: string;
  },
) {
  const now = new Date();
  const yesterday = addDays(startOfUtcDay(now), -1);
  const twoDaysAgo = addDays(startOfUtcDay(now), -2);
  const liveStart = addMinutes(now, -15);
  const liveEnd = addMinutes(liveStart, 30);

  const completed = await prisma.timeSlot.create({
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

  const noShow = await prisma.timeSlot.create({
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

  return {
    completed,
    noShow,
    liveInProgress,
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
    };
    branches: {
      centro: { id: string };
      norte: { id: string };
    };
    citizens: Array<{ id: string }>;
    slots: {
      pendingTheory: DemoSlot;
      confirmedPsychotechnical: DemoSlot;
      confirmedPractical: DemoSlot;
      cancelledPractical: DemoSlot;
      rescheduleFrom: DemoSlot;
      rescheduleTo: DemoSlot;
      completedHistorical: DemoSlot;
      noShowHistorical: DemoSlot;
      liveInProgress: DemoSlot;
    };
  },
) {
  const now = new Date();
  const historyRows: Prisma.AppointmentStatusHistoryCreateManyInput[] = [];
  const cancellationRows: Prisma.AppointmentCancellationCreateManyInput[] = [];
  const rescheduleRows: Prisma.AppointmentRescheduleCreateManyInput[] = [];
  const codes: string[] = [];

  const appointmentPlan: DemoAppointmentSeed[] = [
    {
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
      createdAt: addDays(now, -2),
      statusHistory: [
        {
          fromStatus: null,
          toStatus: AppointmentStatus.PENDING,
          note: 'Appointment created from public booking.',
          metadata: { source: AppointmentSource.WEB },
          changedByStaffUserId: null,
          changedAt: addDays(now, -2),
        },
      ],
    },
    {
      code: 'APT-DEMO-CONFIRM-001',
      branchId: input.branches.norte.id,
      serviceId: input.services.psicotecnico.id,
      citizenId: input.citizens[1]!.id,
      staffUserId: input.norteOperatorId,
      slot: input.slots.confirmedPsychotechnical,
      source: AppointmentSource.WEB,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: 'Solicita confirmacion por correo.',
      internalNotes: 'Aprobada para flujo publico.',
      createdAt: addDays(now, -1),
      statusHistory: [
        {
          fromStatus: null,
          toStatus: AppointmentStatus.CONFIRMED,
          note: 'Appointment confirmed after public booking review.',
          metadata: { source: AppointmentSource.WEB },
          changedByStaffUserId: input.norteOperatorId,
          changedAt: addDays(now, -1),
        },
      ],
    },
    {
      code: 'APT-DEMO-CONFIRM-002',
      branchId: input.branches.centro.id,
      serviceId: input.services.practica.id,
      citizenId: input.citizens[2]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.confirmedPractical,
      source: AppointmentSource.STAFF,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: null,
      internalNotes: 'Confirmada por operador desde backoffice.',
      createdAt: addDays(now, -1),
      statusHistory: [
        {
          fromStatus: null,
          toStatus: AppointmentStatus.CONFIRMED,
          note: 'Appointment created by branch operator.',
          metadata: { source: AppointmentSource.STAFF },
          changedByStaffUserId: input.centroOperatorId,
          changedAt: addDays(now, -1),
        },
      ],
    },
    {
      code: 'APT-DEMO-RESCHED-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.teorica.id,
      citizenId: input.citizens[3]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.rescheduleTo,
      source: AppointmentSource.WEB,
      status: AppointmentStatus.CONFIRMED,
      citizenNotes: 'Prefiere bloque de media manana.',
      internalNotes: 'Caso demo con reagendamiento.',
      createdAt: addDays(now, -3),
      statusHistory: [
        {
          fromStatus: null,
          toStatus: AppointmentStatus.CONFIRMED,
          note: 'Appointment confirmed from web booking.',
          metadata: { source: AppointmentSource.WEB },
          changedByStaffUserId: null,
          changedAt: addDays(now, -3),
        },
        {
          fromStatus: AppointmentStatus.CONFIRMED,
          toStatus: AppointmentStatus.CONFIRMED,
          note: 'Appointment rescheduled to a later slot.',
          metadata: {
            event: 'rescheduled',
            fromSlotId: input.slots.rescheduleFrom.id,
            toSlotId: input.slots.rescheduleTo.id,
          },
          changedByStaffUserId: input.tenantAdminId,
          changedAt: addDays(now, -1),
        },
      ],
      reschedule: {
        fromSlotId: input.slots.rescheduleFrom.id,
        toSlotId: input.slots.rescheduleTo.id,
        rescheduledByStaffUserId: input.tenantAdminId,
        previousStart: input.slots.rescheduleFrom.startsAt,
        previousEnd: input.slots.rescheduleFrom.endsAt,
        nextStart: input.slots.rescheduleTo.startsAt,
        nextEnd: input.slots.rescheduleTo.endsAt,
        reason: 'Citizen requested a later arrival time.',
        createdAt: addDays(now, -1),
      },
    },
    {
      code: 'APT-DEMO-LIVE-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.teorica.id,
      citizenId: input.citizens[4]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.liveInProgress,
      source: AppointmentSource.STAFF,
      status: AppointmentStatus.IN_PROGRESS,
      citizenNotes: 'Revision prioritaria por vencimiento cercano.',
      internalNotes: 'Atencion en curso para dashboard en vivo.',
      createdAt: addHours(now, -2),
      checkedInAt: addMinutes(now, -20),
      statusHistory: [
        {
          fromStatus: null,
          toStatus: AppointmentStatus.CONFIRMED,
          note: 'Appointment created by backoffice operator.',
          metadata: { source: AppointmentSource.STAFF },
          changedByStaffUserId: input.centroOperatorId,
          changedAt: addHours(now, -2),
        },
        {
          fromStatus: AppointmentStatus.CONFIRMED,
          toStatus: AppointmentStatus.CHECKED_IN,
          note: 'Citizen arrived at the branch.',
          metadata: null,
          changedByStaffUserId: input.centroOperatorId,
          changedAt: addMinutes(now, -20),
        },
        {
          fromStatus: AppointmentStatus.CHECKED_IN,
          toStatus: AppointmentStatus.IN_PROGRESS,
          note: 'Advisor started the in-person attention.',
          metadata: null,
          changedByStaffUserId: input.centroOperatorId,
          changedAt: addMinutes(now, -10),
        },
      ],
    },
    {
      code: 'APT-DEMO-COMPLETE-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.teorica.id,
      citizenId: input.citizens[5]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.completedHistorical,
      source: AppointmentSource.STAFF,
      status: AppointmentStatus.COMPLETED,
      citizenNotes: null,
      internalNotes: 'Documentacion validada sin observaciones.',
      createdAt: addDays(now, -4),
      checkedInAt: addDays(now, -1),
      completedAt: addDays(now, -1),
      statusHistory: [
        {
          fromStatus: null,
          toStatus: AppointmentStatus.CONFIRMED,
          note: 'Appointment created by operator.',
          metadata: { source: AppointmentSource.STAFF },
          changedByStaffUserId: input.centroOperatorId,
          changedAt: addDays(now, -4),
        },
        {
          fromStatus: AppointmentStatus.CONFIRMED,
          toStatus: AppointmentStatus.CHECKED_IN,
          note: 'Citizen checked in at the front desk.',
          metadata: null,
          changedByStaffUserId: input.centroOperatorId,
          changedAt: addDays(now, -1),
        },
        {
          fromStatus: AppointmentStatus.CHECKED_IN,
          toStatus: AppointmentStatus.IN_PROGRESS,
          note: 'Advisor started the evaluation.',
          metadata: null,
          changedByStaffUserId: input.centroOperatorId,
          changedAt: addDays(now, -1),
        },
        {
          fromStatus: AppointmentStatus.IN_PROGRESS,
          toStatus: AppointmentStatus.COMPLETED,
          note: 'Appointment completed successfully.',
          metadata: null,
          changedByStaffUserId: input.centroOperatorId,
          changedAt: addDays(now, -1),
        },
      ],
    },
    {
      code: 'APT-DEMO-CANCEL-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.practica.id,
      citizenId: input.citizens[6]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.cancelledPractical,
      source: AppointmentSource.STAFF,
      status: AppointmentStatus.CANCELLED,
      citizenNotes: 'Solicita nueva fecha por viaje.',
      internalNotes: 'Demostracion de cancelacion con liberacion de cupo.',
      createdAt: addDays(now, -2),
      cancelledAt: addDays(now, -1),
      statusHistory: [
        {
          fromStatus: null,
          toStatus: AppointmentStatus.CONFIRMED,
          note: 'Appointment created by branch operator.',
          metadata: { source: AppointmentSource.STAFF },
          changedByStaffUserId: input.centroOperatorId,
          changedAt: addDays(now, -2),
        },
        {
          fromStatus: AppointmentStatus.CONFIRMED,
          toStatus: AppointmentStatus.CANCELLED,
          note: 'Appointment cancelled before branch visit.',
          metadata: null,
          changedByStaffUserId: input.centroOperatorId,
          changedAt: addDays(now, -1),
        },
      ],
      cancellation: {
        cancelledByStaffUserId: input.centroOperatorId,
        reason: 'Citizen requested cancellation',
        details: 'Citizen called to ask for a later booking during the next week.',
        cancelledAt: addDays(now, -1),
      },
    },
    {
      code: 'APT-DEMO-NOSHOW-001',
      branchId: input.branches.centro.id,
      serviceId: input.services.practica.id,
      citizenId: input.citizens[7]!.id,
      staffUserId: input.centroOperatorId,
      slot: input.slots.noShowHistorical,
      source: AppointmentSource.WEB,
      status: AppointmentStatus.NO_SHOW,
      citizenNotes: null,
      internalNotes: 'No se presento al bloque asignado.',
      createdAt: addDays(now, -6),
      statusHistory: [
        {
          fromStatus: null,
          toStatus: AppointmentStatus.CONFIRMED,
          note: 'Appointment confirmed from web booking.',
          metadata: { source: AppointmentSource.WEB },
          changedByStaffUserId: null,
          changedAt: addDays(now, -6),
        },
        {
          fromStatus: AppointmentStatus.CONFIRMED,
          toStatus: AppointmentStatus.NO_SHOW,
          note: 'Citizen did not arrive for the appointment.',
          metadata: null,
          changedByStaffUserId: input.centroOperatorId,
          changedAt: addDays(now, -2),
        },
      ],
    },
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
          item.completedAt ?? item.cancelledAt ?? item.checkedInAt ?? item.createdAt,
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
