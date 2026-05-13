import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OnboardingStep {
  PERSONAL_INFO = 'PERSONAL_INFO',
  COMPANY_INFO = 'COMPANY_INFO',
  SETUP_TOUR = 'SETUP_TOUR',
  COMPLETED = 'COMPLETED',
}

@Entity('onboarding_states')
export class OnboardingState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: OnboardingStep, default: OnboardingStep.PERSONAL_INFO })
  step: OnboardingStep;

  @Column({ type: 'jsonb', nullable: true })
  surveyData: Record<string, any> | null;

  @Column({ type: 'int', nullable: true })
  feedbackScore: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
