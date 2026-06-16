import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Подготовить релиз v2',
    maxLength: 120,
    description: 'Новое название задачи',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({
    example: 'Проверить итоговые ответы и логи',
    description: 'Новое описание задачи',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    description: 'Статус задачи',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
