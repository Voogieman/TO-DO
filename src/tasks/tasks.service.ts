import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksQueryDto } from './dto/tasks-query.dto';

@Injectable()
export class TasksService {
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
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('task.archived_at IS NULL');

    if (query.status) {
      queryBuilder.andWhere('task.status = :status', { status: query.status });
    }

    queryBuilder.orderBy('task.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, taskId: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    if (task.archivedAt) {
      throw new ForbiddenException(
        'Задача находится в архиве и недоступна для изменения',
      );
    }

    return task;
  }

  async update(userId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(userId, taskId);
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async archive(userId: string, taskId: string) {
    const task = await this.findOne(userId, taskId);
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
}
