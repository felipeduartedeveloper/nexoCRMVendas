import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum OtpPurpose {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  TWO_FACTOR = 'TWO_FACTOR',
}

@Entity('email_otps')
export class EmailOtp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ length: 200 })
  codeHash: string;

  @Column({ type: 'enum', enum: OtpPurpose, default: OtpPurpose.TWO_FACTOR })
  purpose: OtpPurpose;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
