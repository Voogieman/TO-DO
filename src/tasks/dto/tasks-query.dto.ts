import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class TasksQueryDto {
  @ApiPropertyOptional({
    enum: TaskStatus,
    description: 'Фильтр по статусу задачи',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    return value;
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    type: Number,
    description: 'Номер страницы',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
    maximum: 100,
    type: Number,
    description: 'Количество задач на страницу',
  })
  @Type(() => Number)
  @Transform(({ value }: { value: unknown }) =>
    value !== undefined && value !== null && value !== '' ? Number(value) : 10,
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
