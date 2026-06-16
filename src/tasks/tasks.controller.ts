import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksQueryDto } from './dto/tasks-query.dto';
import { TaskStatus } from './enums/task-status.enum';

@ApiTags('Задачи')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Создать задачу' })
  @ApiCreatedResponse({ description: 'Задача создана' })
  @ApiUnauthorizedResponse({ description: 'Необходим JWT токен' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(user.sub, createTaskDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список задач с фильтрацией по статусу и пагинацией',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    description: 'Фильтр по статусу',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество элементов на странице',
    example: 10,
  })
  @ApiOkResponse({ description: 'Список задач' })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: TasksQueryDto) {
    return this.tasksService.findAll(user.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу по id' })
  @ApiParam({ name: 'id', description: 'ID задачи' })
  @ApiOkResponse({ description: 'Данные задачи' })
  @ApiForbiddenResponse({ description: 'Задача архивирована' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tasksService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить задачу (только владельцу)' })
  @ApiParam({ name: 'id', description: 'ID задачи' })
  @ApiOkResponse({ description: 'Задача обновлена' })
  @ApiForbiddenResponse({ description: 'Задача архивирована' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.sub, id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить задачу (перемещение в архив на 7 дней)',
  })
  @ApiParam({ name: 'id', description: 'ID задачи' })
  @ApiOkResponse({
    description: 'Задача архивирована',
    example: {
      message: 'Задача помещена в архив на 7 дней',
      taskId: 'uuid',
      purgeAt: '2026-06-22T18:00:00.000Z',
    },
  })
  archive(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tasksService.archive(user.sub, id);
  }
}
