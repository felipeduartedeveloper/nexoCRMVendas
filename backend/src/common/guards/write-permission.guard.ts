import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { CurrentUserPayload } from '../decorators/current-user.decorator';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Bloqueia escrita (POST/PUT/PATCH/DELETE) para o papel VIEWER (somente leitura).
 * Rotas de auth ficam livres. Roda depois do JwtAuthGuard.
 */
@Injectable()
export class WritePermissionGuard implements CanActivate {
  private readonly allowPrefixes = ['/api/auth/'];

  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const method = String(req.method ?? 'GET').toUpperCase();
    if (!MUTATING.has(method)) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (isPublic) return true;

    const path = String(req.path ?? req.url ?? '').split('?')[0];
    if (this.allowPrefixes.some((p) => path.startsWith(p))) return true;

    const user = req.user as CurrentUserPayload | undefined;
    if (user?.role === 'VIEWER') {
      throw new ForbiddenException('Seu perfil é somente leitura.');
    }
    return true;
  }
}
