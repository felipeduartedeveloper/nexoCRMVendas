import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { ProjectBoard } from './entities/project-board.entity';
import { ProjectPhase } from './entities/project-phase.entity';
import { ProjectTask } from './entities/project-task.entity';
import { ProjectDeal } from './entities/project-deal.entity';
import {
  CreateBoardDto,
  CreatePhaseDto,
  CreateProjectDto,
  CreateTaskDto,
  ReorderPhasesDto,
  UpdateBoardDto,
  UpdatePhaseDto,
  UpdateProjectDto,
  UpdateTaskDto,
} from './dto/project.dto';

const DEFAULT_PHASES: Array<{ name: string; color: string; isCompleted?: boolean }> = [
  { name: 'Onboarding', color: '#6366f1' },
  { name: 'Entrega', color: '#3b82f6' },
  { name: 'Projeto interno', color: '#0ea5e9' },
  { name: 'Marketing', color: '#10b981', isCompleted: true },
];

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly repo: Repository<Project>,
    @InjectRepository(ProjectBoard) private readonly boardRepo: Repository<ProjectBoard>,
    @InjectRepository(ProjectPhase) private readonly phaseRepo: Repository<ProjectPhase>,
    @InjectRepository(ProjectTask) private readonly taskRepo: Repository<ProjectTask>,
    @InjectRepository(ProjectDeal) private readonly dealLinkRepo: Repository<ProjectDeal>,
    private readonly ds: DataSource,
  ) {}

  // ────── Boards ──────
  async listBoards(orgId: string | null): Promise<ProjectBoard[]> {
    return this.boardRepo.find({
      where: orgId ? { organizationId: orgId } : {},
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async createBoard(orgId: string | null, dto: CreateBoardDto): Promise<ProjectBoard> {
    if (!orgId) throw new BadRequestException('Organization is required');
    return this.ds.transaction(async (em) => {
      if (dto.isDefault) {
        await em.update(ProjectBoard, { organizationId: orgId }, { isDefault: false });
      }
      const b = em.create(ProjectBoard, {
        name: dto.name,
        orderIndex: dto.orderIndex ?? 0,
        isDefault: dto.isDefault ?? false,
        organizationId: orgId,
      });
      return em.save(ProjectBoard, b);
    });
  }

  async updateBoard(id: string, orgId: string | null, dto: UpdateBoardDto): Promise<ProjectBoard> {
    return this.ds.transaction(async (em) => {
      const b = await em.findOne(ProjectBoard, {
        where: orgId ? { id, organizationId: orgId } : { id },
      });
      if (!b) throw new NotFoundException('Board not found');
      if (dto.isDefault) {
        await em.update(ProjectBoard, { organizationId: orgId }, { isDefault: false });
      }
      Object.assign(b, dto);
      return em.save(ProjectBoard, b);
    });
  }

  async deleteBoard(id: string, orgId: string | null): Promise<void> {
    const has = await this.repo.count({
      where: { boardId: id, organizationId: orgId ?? undefined, status: 'OPEN' as ProjectStatus },
    });
    if (has > 0) throw new ConflictException(`${has} projeto(s) ativos neste quadro`);
    await this.phaseRepo.delete({ boardId: id });
    await this.boardRepo.delete({ id });
  }

  async ensureDefaultBoard(orgId: string): Promise<ProjectBoard> {
    let board = await this.boardRepo.findOne({
      where: { organizationId: orgId, isDefault: true },
    });
    if (board) return board;
    return this.ds.transaction(async (em) => {
      const b = em.create(ProjectBoard, {
        organizationId: orgId,
        name: 'Entrega',
        isDefault: true,
        orderIndex: 0,
      });
      const saved = await em.save(ProjectBoard, b);
      const phases = DEFAULT_PHASES.map((p, i) =>
        em.create(ProjectPhase, {
          organizationId: orgId,
          boardId: saved.id,
          name: p.name,
          orderIndex: i,
          color: p.color,
          isCompleted: p.isCompleted ?? false,
        }),
      );
      await em.save(ProjectPhase, phases);
      return saved;
    });
  }

  // ────── Phases ──────
  async listPhases(boardId: string, orgId: string | null): Promise<ProjectPhase[]> {
    return this.phaseRepo.find({
      where: { boardId, organizationId: orgId ?? undefined },
      order: { orderIndex: 'ASC' },
    });
  }

  async createPhase(
    boardId: string,
    orgId: string | null,
    dto: CreatePhaseDto,
  ): Promise<ProjectPhase> {
    if (!orgId) throw new BadRequestException('Organization is required');
    const max = await this.phaseRepo
      .createQueryBuilder('p')
      .select('MAX(p.orderIndex)', 'm')
      .where('p.boardId = :boardId', { boardId })
      .getRawOne<{ m: number | null }>();
    const phase = this.phaseRepo.create({
      boardId,
      organizationId: orgId,
      name: dto.name,
      color: dto.color ?? '#3a64ff',
      isCompleted: dto.isCompleted ?? false,
      orderIndex: dto.orderIndex ?? Number(max?.m ?? -1) + 1,
    });
    return this.phaseRepo.save(phase);
  }

  async updatePhase(
    id: string,
    orgId: string | null,
    dto: UpdatePhaseDto,
  ): Promise<ProjectPhase> {
    const ph = await this.phaseRepo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!ph) throw new NotFoundException('Phase not found');
    Object.assign(ph, dto);
    return this.phaseRepo.save(ph);
  }

  async deletePhase(id: string, orgId: string | null): Promise<void> {
    const has = await this.repo.count({
      where: { phaseId: id, organizationId: orgId ?? undefined, status: 'OPEN' as ProjectStatus },
    });
    if (has > 0) throw new ConflictException(`${has} projeto(s) ativos nesta fase`);
    await this.phaseRepo.delete({ id });
  }

  async reorderPhases(
    boardId: string,
    orgId: string | null,
    dto: ReorderPhasesDto,
  ): Promise<void> {
    await this.ds.transaction(async (em) => {
      for (let i = 0; i < dto.phaseIds.length; i++) {
        await em.update(
          ProjectPhase,
          { id: dto.phaseIds[i], boardId, organizationId: orgId ?? undefined },
          { orderIndex: i },
        );
      }
    });
  }

  // ────── Projects ──────
  async list(
    orgId: string | null,
    q: { boardId?: string; phaseId?: string; status?: ProjectStatus; ownerUserId?: string; search?: string },
  ): Promise<Project[]> {
    const qb = this.repo
      .createQueryBuilder('p')
      .orderBy('p.phaseOrderIndex', 'ASC')
      .addOrderBy('p.createdAt', 'DESC');
    if (orgId) qb.where('p.organizationId = :orgId', { orgId });
    if (q.boardId) qb.andWhere('p.boardId = :boardId', { boardId: q.boardId });
    if (q.phaseId) qb.andWhere('p.phaseId = :phaseId', { phaseId: q.phaseId });
    qb.andWhere('p.status = :status', { status: q.status ?? 'OPEN' });
    if (q.ownerUserId) qb.andWhere('p.ownerUserId = :owner', { owner: q.ownerUserId });
    if (q.search) {
      qb.andWhere('LOWER(p.title) LIKE :s', { s: `%${q.search.toLowerCase()}%` });
    }
    return qb.getMany();
  }

  async findById(id: string, orgId: string | null): Promise<Project> {
    const where: any = { id };
    if (orgId) where.organizationId = orgId;
    const p = await this.repo.findOne({ where });
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  async create(
    orgId: string | null,
    ownerUserId: string,
    dto: CreateProjectDto,
  ): Promise<Project> {
    if (!orgId) throw new BadRequestException('Organization is required');
    return this.ds.transaction(async (em) => {
      let boardId = dto.boardId;
      let phaseId = dto.phaseId;
      if (!boardId) {
        const board = await this.ensureDefaultBoard(orgId);
        boardId = board.id;
      }
      if (!phaseId) {
        const first = await em.findOne(ProjectPhase, {
          where: { boardId, organizationId: orgId },
          order: { orderIndex: 'ASC' },
        });
        if (!first) throw new BadRequestException('Board has no phases');
        phaseId = first.id;
      }
      const maxOrder = await em
        .createQueryBuilder(Project, 'p')
        .select('MAX(p.phaseOrderIndex)', 'm')
        .where('p.phaseId = :phaseId', { phaseId })
        .getRawOne<{ m: number | null }>();

      const p = em.create(Project, {
        organizationId: orgId,
        ownerUserId: dto.ownerUserId ?? ownerUserId,
        title: dto.title,
        description: dto.description ?? null,
        startDate: dto.startDate ?? null,
        endDate: dto.endDate ?? null,
        health: dto.health ?? 'ON_TRACK',
        progress: dto.progress ?? 0,
        boardId,
        phaseId,
        phaseOrderIndex: Number(maxOrder?.m ?? -1) + 1,
        contactId: dto.contactId ?? null,
        orgCompanyId: dto.orgCompanyId ?? null,
        labels: dto.labels ?? null,
        visibleTo: dto.visibleTo ?? 'ENTIRE_COMPANY',
        status: 'OPEN',
      });
      return em.save(Project, p);
    });
  }

  async update(id: string, orgId: string | null, dto: UpdateProjectDto): Promise<Project> {
    const p = await this.findById(id, orgId);
    Object.assign(p, dto);
    return this.repo.save(p);
  }

  async move(
    id: string,
    orgId: string | null,
    phaseId: string,
    order: number,
  ): Promise<Project> {
    return this.ds.transaction(async (em) => {
      const p = await em.findOne(Project, {
        where: orgId ? { id, organizationId: orgId } : { id },
      });
      if (!p) throw new NotFoundException('Project not found');
      p.phaseId = phaseId;
      p.phaseOrderIndex = order;
      await em.save(Project, p);
      // best-effort reorder others in target phase
      const others = await em.find(Project, {
        where: { phaseId, organizationId: orgId ?? undefined, status: 'OPEN' },
        order: { phaseOrderIndex: 'ASC' },
      });
      const filtered = others.filter((o) => o.id !== p.id);
      filtered.splice(order, 0, p);
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].phaseOrderIndex !== i) {
          await em.update(Project, { id: filtered[i].id }, { phaseOrderIndex: i });
        }
      }
      return p;
    });
  }

  async complete(id: string, orgId: string | null): Promise<Project> {
    const p = await this.findById(id, orgId);
    p.status = 'COMPLETED';
    p.progress = 100;
    return this.repo.save(p);
  }

  async archive(id: string, orgId: string | null): Promise<Project> {
    const p = await this.findById(id, orgId);
    p.status = 'CANCELED';
    return this.repo.save(p);
  }

  async delete(id: string, orgId: string | null): Promise<void> {
    const p = await this.findById(id, orgId);
    p.status = 'DELETED';
    await this.repo.save(p);
  }

  async summary(orgId: string | null, boardId: string) {
    const phases = await this.listPhases(boardId, orgId);
    const projects = await this.list(orgId, { boardId, status: 'OPEN' });
    const byPhase = new Map<string, Project[]>();
    for (const p of projects) {
      const list = byPhase.get(p.phaseId) ?? [];
      list.push(p);
      byPhase.set(p.phaseId, list);
    }
    return phases.map((ph) => {
      const ps = byPhase.get(ph.id) ?? [];
      const avg = ps.length
        ? Math.round(ps.reduce((acc, p) => acc + p.progress, 0) / ps.length)
        : 0;
      return { phaseId: ph.id, name: ph.name, color: ph.color, count: ps.length, avgProgress: avg };
    });
  }

  // ────── Tasks ──────
  async listTasks(projectId: string, orgId: string | null): Promise<ProjectTask[]> {
    return this.taskRepo.find({
      where: { projectId, organizationId: orgId ?? undefined },
      order: { done: 'ASC', createdAt: 'ASC' },
    });
  }

  async createTask(
    projectId: string,
    orgId: string | null,
    dto: CreateTaskDto,
  ): Promise<ProjectTask> {
    if (!orgId) throw new BadRequestException('Organization is required');
    await this.findById(projectId, orgId);
    const t = this.taskRepo.create({
      projectId,
      organizationId: orgId,
      title: dto.title,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      ownerUserId: dto.ownerUserId ?? null,
      done: false,
    });
    const saved = await this.taskRepo.save(t);
    await this.recalculateProgress(projectId, orgId);
    return saved;
  }

  async updateTask(id: string, orgId: string | null, dto: UpdateTaskDto): Promise<ProjectTask> {
    const t = await this.taskRepo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!t) throw new NotFoundException('Task not found');
    Object.assign(t, {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : t.dueDate,
    });
    const saved = await this.taskRepo.save(t);
    await this.recalculateProgress(t.projectId, orgId);
    return saved;
  }

  async toggleTaskDone(id: string, orgId: string | null): Promise<ProjectTask> {
    const t = await this.taskRepo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!t) throw new NotFoundException('Task not found');
    t.done = !t.done;
    const saved = await this.taskRepo.save(t);
    await this.recalculateProgress(t.projectId, orgId);
    return saved;
  }

  async deleteTask(id: string, orgId: string | null): Promise<void> {
    const t = await this.taskRepo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!t) throw new NotFoundException('Task not found');
    await this.taskRepo.remove(t);
    await this.recalculateProgress(t.projectId, orgId);
  }

  private async recalculateProgress(projectId: string, orgId: string | null): Promise<void> {
    const tasks = await this.taskRepo.find({
      where: { projectId, organizationId: orgId ?? undefined },
    });
    if (!tasks.length) return;
    const done = tasks.filter((t) => t.done).length;
    const progress = Math.round((done / tasks.length) * 100);
    await this.repo.update({ id: projectId }, { progress });
  }

  // ────── Deal links ──────
  async linkDeal(projectId: string, dealId: string, orgId: string | null): Promise<ProjectDeal> {
    if (!orgId) throw new BadRequestException('Organization is required');
    const exist = await this.dealLinkRepo.findOne({
      where: { projectId, dealId, organizationId: orgId },
    });
    if (exist) return exist;
    return this.dealLinkRepo.save(
      this.dealLinkRepo.create({ projectId, dealId, organizationId: orgId }),
    );
  }

  async unlinkDeal(id: string, orgId: string | null): Promise<void> {
    const link = await this.dealLinkRepo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!link) throw new NotFoundException('Link not found');
    await this.dealLinkRepo.remove(link);
  }

  async listDealLinks(projectId: string, orgId: string | null): Promise<ProjectDeal[]> {
    return this.dealLinkRepo.find({
      where: { projectId, organizationId: orgId ?? undefined },
    });
  }
}
