import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Подготовить релиз',
    maxLength: 120,
    description: 'Название задачи',
  })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiProperty({
    example: 'Проверить API и обновить документацию',
    required: false,
    description: 'Описание задачи',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
