import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description: 'Пользователь успешно зарегистрирован',
    example: {
      accessToken: 'jwt-token',
      user: { id: 'uuid', email: 'user@example.com' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Пользователь с таким email уже существует',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход пользователя в систему' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Успешная авторизация',
    example: {
      accessToken: 'jwt-token',
      user: { id: 'uuid', email: 'user@example.com' },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Неверный email или пароль' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
