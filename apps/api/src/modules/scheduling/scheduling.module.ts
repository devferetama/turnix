import { Module } from '@nestjs/common';
import { AvailabilityRulesController } from './availability-rules.controller';
import { AvailabilityRulesService } from './availability-rules.service';
import { SlotGenerationController } from './slot-generation.controller';
import { SlotGenerationService } from './slot-generation.service';

@Module({
  controllers: [AvailabilityRulesController, SlotGenerationController],
  providers: [AvailabilityRulesService, SlotGenerationService],
  exports: [AvailabilityRulesService, SlotGenerationService],
})
export class SchedulingModule {}
