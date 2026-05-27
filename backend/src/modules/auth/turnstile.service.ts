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
    if (!token) {
      this.logger.warn('Turnstile: requisição sem captchaToken no corpo.');
      return false;
    }

    // remoteip é OPCIONAL; só envia se for um IP público válido (evita mismatch
    // quando atrás do túnel/Docker, onde req.ip pode ser interno).
    const body = new URLSearchParams({ secret: this.secret, response: token });
    const publicIp = ip && !/^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|fc|fd)/.test(ip);
    if (publicIp) body.append('remoteip', ip!);

    try {
      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body,
      });
      const data = (await res.json()) as { success: boolean; 'error-codes'?: string[]; hostname?: string };
      if (!data.success) {
        this.logger.warn(
          `Turnstile recusou: errors=${JSON.stringify(data['error-codes'])} hostname=${data.hostname} ip=${publicIp ? ip : '(omitido)'} tokenLen=${token.length}`,
        );
      }
      return !!data.success;
    } catch (err: any) {
      this.logger.error(`Falha ao verificar Turnstile: ${err?.message}`);
      return false;
    }
  }
}
