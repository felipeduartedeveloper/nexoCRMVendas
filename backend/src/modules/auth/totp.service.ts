import { Injectable } from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import * as QRCode from 'qrcode';

/**
 * TOTP (Google Authenticator / Authy / etc.) via otpauth.
 * SHA1, 6 dígitos, período 30s, tolerância de ±1 janela (clock skew).
 */
@Injectable()
export class TotpService {
  private get issuer(): string {
    return process.env.TOTP_ISSUER || 'Oxlify';
  }

  private build(secretBase32: string, label?: string): OTPAuth.TOTP {
    return new OTPAuth.TOTP({
      issuer: this.issuer,
      label: label ?? this.issuer,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });
  }

  /** Gera um novo segredo base32 (20 bytes / 160 bits). */
  generateSecret(): string {
    return new OTPAuth.Secret({ size: 20 }).base32;
  }

  /** URL otpauth:// para o QR (compatível com Google Authenticator). */
  buildOtpAuthUrl(label: string, secretBase32: string): string {
    return this.build(secretBase32, label).toString();
  }

  /** Converte a URL otpauth em data URL (imagem) do QR. */
  toQrDataUrl(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }

  /** Valida um código de 6 dígitos contra o segredo (janela ±1). */
  verify(secretBase32: string, token: string): boolean {
    return this.build(secretBase32).validate({ token, window: 1 }) !== null;
  }
}
