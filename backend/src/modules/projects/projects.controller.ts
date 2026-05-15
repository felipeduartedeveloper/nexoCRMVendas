import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CurrentOrg, CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateBoardDto,
  CreatePhaseDto,
  CreateProjectDto,
  CreateTaskDto,
  MoveProjectDto,
  ReorderPhasesDto,
  UpdateBoardDto,
  UpdatePhaseDto,
  UpdateProjectDto,
  UpdateTaskDto,
} from './dto/project.dto';
import type { ProjectStatus } from './entities/project.entity';

@ApiTags('projects')
@ApiBearerAuth()
@Controller()
export class ProjectsController {
  constructor(private readonly svc: ProjectsService) {}

  // Boards & phases
  @Get('project-boards')
  listBoards(@CurrentOrg() orgId: string | null) {
    return this.svc.listBoards(orgId);
  }

  @Post('project-boards')
  createBoard(@CurrentOrg() orgId: string | null, @Body() dto: CreateBoardDto) {
    return this.svc.createBoard(orgId, dto);
  }

  @Patch('project-boards/:id')
  updateBoard(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.svc.updateBoard(id, orgId, dto);
  }

  @Delete('project-boards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBoard(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.deleteBoard(id, orgId);
  }

  @Get('project-boards/:id/phases')
  listPhases(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) boardId: string,
  ) {
    return this.svc.listPhases(boardId, orgId);
  }

  @Post('project-boards/:id/phases')
  createPhase(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) boardId: string,
    @Body() dto: CreatePhaseDto,
  ) {
    return this.svc.createPhase(boardId, orgId, dto);
  }

  @Patch('project-boards/phases/:phaseId')
  updatePhase(
    @CurrentOrg() orgId: string | null,
    @Param('phaseId', ParseUUIDPipe) phaseId: string,
    @Body() dto: UpdatePhaseDto,
  ) {
    return this.svc.updatePhase(phaseId, orgId, dto);
  }

  @Delete('project-boards/phases/:phaseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhase(
    @CurrentOrg() orgId: string | null,
    @Param('phaseId', ParseUUIDPipe) phaseId: string,
  ) {
    await this.svc.deletePhase(phaseId, orgId);
  }

  @Post('project-boards/:id/phases/reorder')
  reorderPhases(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) boardId: string,
    @Body() dto: ReorderPhasesDto,
  ) {
    return this.svc.reorderPhases(boardId, orgId, dto);
  }

  // Projects
  @Get('projects')
  list(
    @CurrentOrg() orgId: string | null,
    @Query()
    q: {
      boardId?: string;
      phaseId?: string;
      status?: ProjectStatus;
      ownerUserId?: string;
      search?: string;
    },
  ) {
    return this.svc.list(orgId, q);
  }

  @Get('projects/summary')
  summary(
    @CurrentOrg() orgId: string | null,
    @Query('boardId', ParseUUIDPipe) boardId: string,
  ) {
    return this.svc.summary(orgId, boardId);
  }

  @Get('projects/:id')
  one(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findById(id, orgId);
  }

  @Post('projects')
  create(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.svc.create(orgId, userId, dto);
  }

  @Patch('projects/:id')
  update(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.svc.update(id, orgId, dto);
  }

  @Patch('projects/:id/move')
  move(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveProjectDto,
  ) {
    return this.svc.move(id, orgId, dto.phaseId, dto.order);
  }

  @Post('projects/:id/complete')
  complete(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.complete(id, orgId);
  }

  @Post('projects/:id/archive')
  archive(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.archive(id, orgId);
  }

  @Delete('projects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.delete(id, orgId);
  }

  // Tasks
  @Get('projects/:projectId/tasks')
  listTasks(
    @CurrentOrg() orgId: string | null,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.svc.listTasks(projectId, orgId);
  }

  @Post('projects/:projectId/tasks')
  createTask(
    @CurrentOrg() orgId: string | null,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.svc.createTask(projectId, orgId, dto);
  }

  @Patch('project-tasks/:id')
  updateTask(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.svc.updateTask(id, orgId, dto);
  }

  @Patch('project-tasks/:id/done')
  toggleTaskDone(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.toggleTaskDone(id, orgId);
  }

  @Delete('project-tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.deleteTask(id, orgId);
  }

  // Deal links
  @Get('projects/:projectId/deal-links')
  listDealLinks(
    @CurrentOrg() orgId: string | null,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.svc.listDealLinks(projectId, orgId);
  }

  @Post('projects/:projectId/deal-links')
  linkDeal(
    @CurrentOrg() orgId: string | null,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() body: { dealId: string },
  ) {
    return this.svc.linkDeal(projectId, body.dealId, orgId);
  }

  @Delete('project-deal-links/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkDeal(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.svc.unlinkDeal(id, orgId);
  }
}
