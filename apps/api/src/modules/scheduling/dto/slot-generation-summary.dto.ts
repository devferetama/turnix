import { ApiProperty } from '@nestjs/swagger';

export class SlotGenerationSummaryDto {
  @ApiProperty({ example: '2026-04-01' })
  fromDate!: string;

  @ApiProperty({ example: '2026-04-07' })
  toDate!: string;

  @ApiProperty({
    description: 'Number of active rules considered for generation.',
    example: 4,
  })
  rulesProcessed!: number;

  @ApiProperty({
    description: 'Number of new materialized slots created.',
    example: 56,
  })
  createdCount!: number;

  @ApiProperty({
    description:
      'Number of candidate slots skipped because they already existed, were blocked, or were duplicated in the same run.',
    example: 8,
  })
  skippedCount!: number;
}
