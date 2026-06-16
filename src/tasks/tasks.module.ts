import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { TasksCleanupService } from './tasks-cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  providers: [TasksService, TasksCleanupService],
  controllers: [TasksController],
})
export class TasksModule {}
