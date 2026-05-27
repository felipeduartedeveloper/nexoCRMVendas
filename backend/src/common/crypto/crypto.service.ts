import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Cifra/decifra segredos sensíveis em repouso (ex.: segredo TOTP) com
 * AES-256-GCM. A chave vem de TOTP_ENCRYPTION_KEY (64 chars hex = 32 bytes).
 * Formato de saída: iv:authTag:ciphertext (tudo em hex).
 */
@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor() {
    const hex = process.env.TOTP_ENCRYPTION_KEY || '';
    if (hex.length !== 64) {
      throw new Error(
        'TOTP_ENCRYPTION_KEY deve ter 64 caracteres hex (32 bytes). ' +
          'Gere com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
      );
    }
    this.key = Buffer.from(hex, 'hex');
  }

  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
  }

  decrypt(payload: string): string {
    const [ivHex, tagHex, dataHex] = payload.split(':');
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]).toString('utf8');
  }
}
