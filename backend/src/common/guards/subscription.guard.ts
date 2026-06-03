import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../modules/organizations/organization.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { CurrentUserPayload } from '../decorators/current-user.decorator';
import { computeAccess, hasActiveAccess } from '../utils/subscription-access';

/**
 * Paywall server-side. Bloqueia (HTTP 402) os endpoints de negócio quando o
 * trial expirou e não há assinatura ativa. Whitelista auth, billing, onboarding,
 * health e os "self" endpoints (organizations/current, users/me).
 *
 * Roda depois do JwtAuthGuard (registrado depois no app.module), então
 * `req.user` já está populado em rotas autenticadas.
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly allowExact = new Set<string>([
    '/api/organizations/current',
    '/api/users/me',
    '/api/health',
  ]);
  private readonly allowPrefixes = ['/api/auth/', '/api/billing/', '/api/onboarding'];

  constructor(
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    const path = String(req.path ?? req.url ?? '').split('?')[0];
    if (this.allowExact.has(path)) return true;
    if (this.allowPrefixes.some((p) => path.startsWith(p))) return true;

    const user = req.user as CurrentUserPayload | undefined;
    if (!user) return true; // sem auth → JwtAuthGuard barra
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) return true;

    const org = await this.orgRepo.findOne({ where: { id: user.organizationId } });
    if (!org) return true;

    const access = computeAccess(org);
    if (hasActiveAccess(access)) return true;

    throw new HttpException(
      { statusCode: 402, error: 'Payment Required', code: 'SUBSCRIPTION_REQUIRED', access },
      402,
    );
  }
}
