import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass123',
    minLength: 8,
    description: 'Пароль (минимум 8 символов)',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
