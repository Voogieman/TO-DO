import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksQueryDto } from './dto/tasks-query.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private static readonly FIND_ALL_TIMEOUT_MS = 10_000;

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      description: createTaskDto.description ?? null,
      userId,
    });
    return this.tasksRepository.save(task);
  }

  async findAll(userId: string, query: TasksQueryDto) {
    const startedAt = Date.now();
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = {
      userId,
      archivedAt: IsNull(),
      ...(query.status ? { status: query.status } : {}),
    };
    const pagination = {
      order: { createdAt: 'DESC' as const },
      skip: (page - 1) * limit,
      take: limit,
    };

    try {
      const [items, total] = await this.withTimeout(
        this.tasksRepository.findAndCount({
          where,
          ...pagination,
        }),
        TasksService.FIND_ALL_TIMEOUT_MS,
      );

      return {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      this.logger.error(
        `findAll failed: userId=${userId}, status=${query.status ?? 'all'}, page=${page}, limit=${limit}, durationMs=${Date.now() - startedAt}, error=${message}`,
      );
      throw error;
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new RequestTimeoutException(
            `Запрос к базе превысил таймаут ${timeoutMs}ms`,
          ),
        );
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  async findOne(userId: string, taskId: string): Promise<Task> {
    return this.findOneByOwner(userId, taskId);
  }

  async update(userId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOneForWrite(userId, taskId);
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async archive(userId: string, taskId: string) {
    const task = await this.findOneForWrite(userId, taskId);
    const now = new Date();
    const purgeAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    task.archivedAt = now;
    task.purgeAt = purgeAt;
    await this.tasksRepository.save(task);

    return {
      message: 'Задача помещена в архив на 7 дней',
      taskId: task.id,
      purgeAt,
    };
  }

  async purgeExpiredArchivedTasks() {
    await this.tasksRepository
      .createQueryBuilder()
      .delete()
      .where('purge_at IS NOT NULL')
      .andWhere('purge_at <= :now', { now: new Date() })
      .execute();
  }

  private async findOneByOwner(userId: string, taskId: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    return task;
  }

  private async findOneForWrite(userId: string, taskId: string): Promise<Task> {
    const task = await this.findOneByOwner(userId, taskId);

    if (task.archivedAt) {
      throw new ForbiddenException(
        'Задача находится в архиве и недоступна для изменения',
      );
    }

    return task;
  }
}
