import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AvailabilityExceptionType,
  Prisma,
  SlotStatus,
  Weekday,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

const MAX_GENERATION_DAYS = 90;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const CREATE_MANY_BATCH_SIZE = 500;
const SERIALIZABLE_RETRY_LIMIT = 2;

const availabilityRuleSelect =
  Prisma.validator<Prisma.AvailabilityRuleSelect>()({
    id: true,
    branchId: true,
    serviceId: true,
    staffUserId: true,
    weekday: true,
    startMinute: true,
    endMinute: true,
    slotDurationMinutes: true,
    capacity: true,
    validFrom: true,
    validTo: true,
  });

const blockExceptionSelect =
  Prisma.validator<Prisma.AvailabilityExceptionSelect>()({
    id: true,
    branchId: true,
    serviceId: true,
    staffUserId: true,
    startsAt: true,
    endsAt: true,
  });

type AvailabilityRuleRecord = Prisma.AvailabilityRuleGetPayload<{
  select: typeof availabilityRuleSelect;
}>;

type BlockExceptionRecord = Prisma.AvailabilityExceptionGetPayload<{
  select: typeof blockExceptionSelect;
}>;

type GenerationRange = {
  fromDate: string;
  toDate: string;
  fromDay: Date;
  toDay: Date;
  rangeStart: Date;
  rangeEndExclusive: Date;
};

type SlotGenerationSummary = {
  fromDate: string;
  toDate: string;
  rulesProcessed: number;
  createdCount: number;
  skippedCount: number;
};

@Injectable()
export class SlotGenerationService {
  constructor(private readonly prisma: PrismaService) {}

  async generateSlotsForTenant(
    tenantId: string,
    fromDateInput: string,
    toDateInput: string,
  ): Promise<SlotGenerationSummary> {
    const range = this.parseGenerationRange(fromDateInput, toDateInput);

    return this.runWithSerializableRetry(() =>
      this.prisma.$transaction(
        (tx) => this.generateSlotsInTransaction(tx, tenantId, range),
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      ),
    );
  }

  private async generateSlotsInTransaction(
    tx: Prisma.TransactionClient,
    tenantId: string,
    range: GenerationRange,
  ): Promise<SlotGenerationSummary> {
    const [rules, existingSlots, blockExceptions] = await Promise.all([
      tx.availabilityRule.findMany({
        where: {
          tenantId,
          isActive: true,
          AND: [
            {
              OR: [{ validFrom: null }, { validFrom: { lte: range.toDay } }],
            },
            {
              OR: [{ validTo: null }, { validTo: { gte: range.fromDay } }],
            },
          ],
        },
        select: availabilityRuleSelect,
        orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }],
      }),
      tx.timeSlot.findMany({
        where: {
          tenantId,
          startsAt: {
            gte: range.rangeStart,
            lt: range.rangeEndExclusive,
          },
        },
        select: {
          serviceId: true,
          staffUserId: true,
          startsAt: true,
        },
      }),
      tx.availabilityException.findMany({
        where: {
          tenantId,
          type: AvailabilityExceptionType.BLOCK,
          startsAt: {
            lt: range.rangeEndExclusive,
          },
          endsAt: {
            gt: range.rangeStart,
          },
        },
        select: blockExceptionSelect,
      }),
    ]);

    if (rules.length === 0) {
      return {
        fromDate: range.fromDate,
        toDate: range.toDate,
        rulesProcessed: 0,
        createdCount: 0,
        skippedCount: 0,
      };
    }

    const existingKeys = new Set(
      existingSlots.map((slot) =>
        this.buildSlotKey(slot.serviceId, slot.startsAt, slot.staffUserId),
      ),
    );
    const rulesByWeekday = this.groupRulesByWeekday(rules);
    const slotsToCreate: Prisma.TimeSlotCreateManyInput[] = [];
    const generatedKeys = new Set<string>(existingKeys);
    let skippedCount = 0;

    for (
      let currentDay = range.fromDay;
      currentDay <= range.toDay;
      currentDay = addDays(currentDay, 1)
    ) {
      const weekday = weekdayFromDate(currentDay);
      const rulesForDay = rulesByWeekday.get(weekday) ?? [];

      for (const rule of rulesForDay) {
        if (!this.isRuleActiveOnDate(rule, currentDay)) {
          continue;
        }

        for (
          let minuteCursor = rule.startMinute;
          minuteCursor + rule.slotDurationMinutes <= rule.endMinute;
          minuteCursor += rule.slotDurationMinutes
        ) {
          const startsAt = addMinutes(currentDay, minuteCursor);
          const endsAt = addMinutes(
            currentDay,
            minuteCursor + rule.slotDurationMinutes,
          );
          const slotKey = this.buildSlotKey(
            rule.serviceId,
            startsAt,
            rule.staffUserId,
          );

          if (generatedKeys.has(slotKey)) {
            skippedCount += 1;
            continue;
          }

          if (
            this.isBlockedByException(rule, startsAt, endsAt, blockExceptions)
          ) {
            generatedKeys.add(slotKey);
            skippedCount += 1;
            continue;
          }

          generatedKeys.add(slotKey);
          slotsToCreate.push({
            tenantId,
            branchId: rule.branchId,
            serviceId: rule.serviceId,
            staffUserId: rule.staffUserId,
            availabilityRuleId: rule.id,
            slotDate: currentDay,
            startsAt,
            endsAt,
            capacity: rule.capacity,
            reservedCount: 0,
            status: SlotStatus.OPEN,
            isPublic: true,
          });
        }
      }
    }

    let createdCount = 0;

    for (
      let chunkStart = 0;
      chunkStart < slotsToCreate.length;
      chunkStart += CREATE_MANY_BATCH_SIZE
    ) {
      const chunk = slotsToCreate.slice(
        chunkStart,
        chunkStart + CREATE_MANY_BATCH_SIZE,
      );

      if (chunk.length === 0) {
        continue;
      }

      const result = await tx.timeSlot.createMany({
        data: chunk,
      });
      createdCount += result.count;
    }

    return {
      fromDate: range.fromDate,
      toDate: range.toDate,
      rulesProcessed: rules.length,
      createdCount,
      skippedCount,
    };
  }

  private parseGenerationRange(
    fromDateInput: string,
    toDateInput: string,
  ): GenerationRange {
    const fromDay = parseDateOnly(fromDateInput);
    const toDay = parseDateOnly(toDateInput);

    if (toDay < fromDay) {
      throw new BadRequestException('toDate must not be before fromDate');
    }

    const daySpan =
      Math.floor((toDay.getTime() - fromDay.getTime()) / MS_PER_DAY) + 1;

    if (daySpan > MAX_GENERATION_DAYS) {
      throw new BadRequestException(
        `Date range is too large. Generate at most ${MAX_GENERATION_DAYS} days per request`,
      );
    }

    return {
      fromDate: formatDateOnly(fromDay),
      toDate: formatDateOnly(toDay),
      fromDay,
      toDay,
      rangeStart: fromDay,
      rangeEndExclusive: addDays(toDay, 1),
    };
  }

  private groupRulesByWeekday(rules: AvailabilityRuleRecord[]) {
    const rulesByWeekday = new Map<Weekday, AvailabilityRuleRecord[]>();

    for (const rule of rules) {
      const existingRules = rulesByWeekday.get(rule.weekday) ?? [];
      existingRules.push(rule);
      rulesByWeekday.set(rule.weekday, existingRules);
    }

    return rulesByWeekday;
  }

  private isRuleActiveOnDate(rule: AvailabilityRuleRecord, day: Date) {
    if (rule.validFrom && day < normalizeDate(rule.validFrom)) {
      return false;
    }

    if (rule.validTo && day > normalizeDate(rule.validTo)) {
      return false;
    }

    return true;
  }

  private isBlockedByException(
    rule: AvailabilityRuleRecord,
    startsAt: Date,
    endsAt: Date,
    blockExceptions: BlockExceptionRecord[],
  ) {
    return blockExceptions.some((exception) => {
      if (exception.branchId !== rule.branchId) {
        return false;
      }

      if (exception.serviceId && exception.serviceId !== rule.serviceId) {
        return false;
      }

      if (exception.staffUserId && exception.staffUserId !== rule.staffUserId) {
        return false;
      }

      return exception.startsAt < endsAt && exception.endsAt > startsAt;
    });
  }

  private buildSlotKey(
    serviceId: string,
    startsAt: Date,
    staffUserId?: string | null,
  ) {
    return `${serviceId}:${staffUserId ?? 'unassigned'}:${startsAt.toISOString()}`;
  }

  private async runWithSerializableRetry<T>(
    operation: () => Promise<T>,
    attempt = 0,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        attempt < SERIALIZABLE_RETRY_LIMIT &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        return this.runWithSerializableRetry(operation, attempt + 1);
      }

      throw error;
    }
  }
}

function parseDateOnly(input: string) {
  const parsed = new Date(`${input}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`Invalid date value: ${input}`);
  }

  return parsed;
}

function normalizeDate(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function weekdayFromDate(date: Date): Weekday {
  const weekdayByIndex: Weekday[] = [
    Weekday.SUNDAY,
    Weekday.MONDAY,
    Weekday.TUESDAY,
    Weekday.WEDNESDAY,
    Weekday.THURSDAY,
    Weekday.FRIDAY,
    Weekday.SATURDAY,
  ];

  return weekdayByIndex[date.getUTCDay()];
}

function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}
