import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectBoard } from './entities/project-board.entity';
import { ProjectPhase } from './entities/project-phase.entity';
import { ProjectTask } from './entities/project-task.entity';
import { ProjectDeal } from './entities/project-deal.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectBoard, ProjectPhase, ProjectTask, ProjectDeal]),
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
