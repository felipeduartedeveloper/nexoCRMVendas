import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pipeline } from './pipeline.entity';
import { Stage } from './stage.entity';

@Injectable()
export class PipelinesService {
  constructor(
    @InjectRepository(Pipeline) private readonly repo: Repository<Pipeline>,
    @InjectRepository(Stage) private readonly stageRepo: Repository<Stage>,
  ) {}

  async list(orgId: string | null) {
    const pipelines = await this.repo.find({
      where: orgId ? { organizationId: orgId } : {},
      order: { orderIndex: 'ASC' },
    });
    const ids = pipelines.map((p) => p.id);
    const stages = ids.length
      ? await this.stageRepo.find({ where: ids.map((id) => ({ pipelineId: id })), order: { orderIndex: 'ASC' } })
      : [];
    return pipelines.map((p) => ({
      ...p,
      stages: stages.filter((s) => s.pipelineId === p.id),
    }));
  }

  async stagesByPipeline(pipelineId: string) {
    return this.stageRepo.find({ where: { pipelineId }, order: { orderIndex: 'ASC' } });
  }
}
