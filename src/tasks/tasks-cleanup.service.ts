import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TasksService } from './tasks.service';

@Injectable()
export class TasksCleanupService {
  private readonly logger = new Logger(TasksCleanupService.name);

  constructor(private readonly tasksService: TasksService) {}

  @Cron('0 0 * * *')
  async removeExpiredArchivedTasks() {
    await this.tasksService.purgeExpiredArchivedTasks();
    this.logger.log('Очистка просроченных архивных задач выполнена');
  }
}
