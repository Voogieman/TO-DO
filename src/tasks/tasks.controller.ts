import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { TasksService } from './tasks.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksQueryDto } from './dto/tasks-query.dto';
import { TaskStatus } from './enums/task-status.enum';

type RequestWithUser = Request & { user: JwtPayload };

@ApiTags('Задачи')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Создать задачу' })
  @ApiCreatedResponse({ description: 'Задача создана' })
  @ApiUnauthorizedResponse({ description: 'Необходим JWT токен' })
  create(@Req() req: RequestWithUser, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.sub, createTaskDto);
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
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество элементов на странице',
    type: Number,
    example: 10,
  })
  @ApiOkResponse({ description: 'Список задач' })
  findAll(@Req() req: RequestWithUser, @Query() query: TasksQueryDto) {
    return this.tasksService.findAll(req.user.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу по id' })
  @ApiParam({ name: 'id', description: 'ID задачи' })
  @ApiOkResponse({ description: 'Данные задачи' })
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.tasksService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить задачу (только владельцу)' })
  @ApiParam({ name: 'id', description: 'ID задачи' })
  @ApiOkResponse({ description: 'Задача обновлена' })
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  @ApiForbiddenResponse({ description: 'Задача архивирована' })
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(req.user.sub, id, updateTaskDto);
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
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  @ApiForbiddenResponse({ description: 'Задача архивирована' })
  archive(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.tasksService.archive(req.user.sub, id);
  }
}
