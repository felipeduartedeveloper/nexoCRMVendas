import { Injectable, Logger } from '@nestjs/common';

/**
 * Verifica tokens do Cloudflare Turnstile (captcha) no backend.
 * Desativado (sempre aprova) se TURNSTILE_SECRET_KEY estiver vazio — útil em dev.
 */
@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);
  private readonly secret = process.env.TURNSTILE_SECRET_KEY || undefined;

  get enabled(): boolean {
    return !!this.secret;
  }

  async verify(token?: string, ip?: string): Promise<boolean> {
    if (!this.secret) return true; // desativado
    if (!token) return false;

    const body = new URLSearchParams({ secret: this.secret, response: token });
    if (ip) body.append('remoteip', ip);

    try {
      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body,
      });
      const data = (await res.json()) as { success: boolean };
      return !!data.success;
    } catch (err: any) {
      this.logger.error(`Falha ao verificar Turnstile: ${err?.message}`);
      return false;
    }
  }
}
