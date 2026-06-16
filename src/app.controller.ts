import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Сервис')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Проверка доступности сервиса' })
  @ApiOkResponse({
    description: 'Сервис работает',
    example: { status: 'ok' },
  })
  getHealth() {
    return { status: 'ok' };
  }
}
