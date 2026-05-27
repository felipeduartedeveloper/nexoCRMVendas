import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { TurnstileService } from '../turnstile.service';

/**
 * Exige um token válido do Cloudflare Turnstile no corpo da requisição
 * (campo `captchaToken`). Se o Turnstile estiver desativado por env, libera.
 */
@Injectable()
export class TurnstileGuard implements CanActivate {
  constructor(private readonly turnstile: TurnstileService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.turnstile.enabled) return true;
    const req = context.switchToHttp().getRequest<Request>();
    const token = (req.body as any)?.captchaToken as string | undefined;
    const ip = (req.headers['cf-connecting-ip'] as string) || req.ip;
    if (!(await this.turnstile.verify(token, ip))) {
      throw new BadRequestException('Verificação anti-robô (captcha) falhou. Tente novamente.');
    }
    return true;
  }
}
