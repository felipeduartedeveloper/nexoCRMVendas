import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Not, Repository } from 'typeorm';
import { Organization, OrganizationPlan } from './organization.entity';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

/**
 * Cron diário que cuida do ciclo de vida do trial de 14 dias:
 *  - faltam 2 dias  → e-mail de aviso (stage 1)
 *  - falta 1 dia    → e-mail de aviso (stage 2)
 *  - expirou        → e-mail de expiração (stage 3)
 * O `trialNoticeStage` na org evita disparos duplicados.
 */
@Injectable()
export class TrialService {
  private readonly logger = new Logger(TrialService.name);

  constructor(
    @InjectRepository(Organization) private readonly orgs: Repository<Organization>,
    private readonly users: UsersService,
    private readonly mail: MailService,
  ) {}

  private get upgradeUrl(): string {
    const base = (process.env.APP_PUBLIC_URL || 'https://sales.oxlify.com').replace(/\/$/, '');
    return `${base}/settings/billing`;
  }

  /** Roda todo dia às 09:00 (America/Sao_Paulo). */
  @Cron('0 9 * * *', { timeZone: 'America/Sao_Paulo' })
  async handleTrials(): Promise<void> {
    const orgs = await this.orgs.find({
      where: {
        plan: OrganizationPlan.TRIAL,
        trialEndsAt: Not(IsNull()),
        trialNoticeStage: LessThan(3),
      },
    });
    if (!orgs.length) return;
    const now = Date.now();
    let sent = 0;

    for (const org of orgs) {
      const daysLeft = Math.ceil((org.trialEndsAt!.getTime() - now) / 86_400_000);
      const admin = await this.users.findOrgAdmin(org.id);
      if (!admin) continue;
      try {
        if (daysLeft <= 0 && org.trialNoticeStage < 3) {
          await this.mail.sendTrialExpired(admin.email, admin.name, this.upgradeUrl);
          org.trialNoticeStage = 3;
        } else if (daysLeft === 1 && org.trialNoticeStage < 2) {
          await this.mail.sendTrialEnding(admin.email, admin.name, 1, this.upgradeUrl);
          org.trialNoticeStage = 2;
        } else if (daysLeft <= 2 && org.trialNoticeStage < 1) {
          await this.mail.sendTrialEnding(admin.email, admin.name, 2, this.upgradeUrl);
          org.trialNoticeStage = 1;
        } else {
          continue;
        }
        await this.orgs.save(org);
        sent++;
      } catch (e: any) {
        this.logger.warn(`Falha no aviso de trial da org ${org.id}: ${e?.message}`);
      }
    }
    if (sent) this.logger.log(`Trial: ${sent} aviso(s) enviado(s).`);
  }
}
