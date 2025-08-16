import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum TimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export class TimeRangeQueryDto {
  @ApiPropertyOptional({
    enum: TimePeriod,
    description: 'Time period filter for transactions (defaults to month)',
    example: TimePeriod.MONTH,
    default: TimePeriod.MONTH,
  })
  @IsOptional()
  @IsEnum(TimePeriod)
  period?: TimePeriod;

  @ApiPropertyOptional({
    type: 'integer',
    minimum: -100,
    maximum: 100,
    description:
      'Period offset (0 = current, negative = past periods, positive = future periods). Example: -1 = last period, 1 = next period',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-100)
  @Max(100)
  offset?: number = 0;
}
