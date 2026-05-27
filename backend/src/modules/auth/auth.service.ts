import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository, MoreThan } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { TotpService } from './totp.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { EmailOtp, OtpPurpose } from './entities/email-otp.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/forgot-reset.dto';

type LoginMeta = { ip?: string; userAgent?: string };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly crypto: CryptoService,
    private readonly totp: TotpService,
    @InjectRepository(RefreshToken) private readonly refreshRepo: Repository<RefreshToken>,
    @InjectRepository(PasswordReset) private readonly resetRepo: Repository<PasswordReset>,
    @InjectRepository(EmailOtp) private readonly otpRepo: Repository<EmailOtp>,
  ) {}

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private signAccess(payload: object) {
    return this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'change-this-access-secret',
      expiresIn: process.env.JWT_ACCESS_TTL || '15m',
    });
  }

  private signRefresh(payload: object) {
    return this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_TTL || '7d',
    });
  }

  private async storeRefresh(userId: string, token: string, meta?: { ip?: string; userAgent?: string }) {
    const ttlDays = 7;
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    await this.refreshRepo.save(
      this.refreshRepo.create({
        userId,
        tokenHash: this.hash(token),
        expiresAt,
        ip: meta?.ip ?? null,
        userAgent: meta?.userAgent ?? null,
      }),
    );
  }

  private buildPayload(user: { id: string; email: string; role: string; organizationId: string | null }) {
    return { sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId };
  }

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmailWithPassword(dto.email);
    if (existing) throw new ConflictException('Email already registered');
    const user = await this.users.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      phone: dto.phone,
    });
    await this.sendOtp(user.email, OtpPurpose.EMAIL_VERIFICATION);
    return { id: user.id, email: user.email, emailVerified: user.emailVerified };
  }

  // ---- tokens temporários (stateless) p/ os passos de TOTP no login ----
  private signTempToken(userId: string, typ: 'totp_setup' | 'totp_challenge') {
    return this.jwt.sign(
      { sub: userId, typ },
      { secret: process.env.JWT_ACCESS_SECRET || 'change-this-access-secret', expiresIn: '10m' },
    );
  }

  private verifyTempToken(token: string, typ: 'totp_setup' | 'totp_challenge'): string {
    let payload: any;
    try {
      payload = this.jwt.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'change-this-access-secret',
      });
    } catch {
      throw new UnauthorizedException('Sessão de verificação expirada. Faça login novamente.');
    }
    if (payload.typ !== typ || !payload.sub) throw new UnauthorizedException('Token inválido');
    return payload.sub;
  }

  private async issueSession(
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      organizationId: string | null;
      emailVerified: boolean;
    },
    meta?: LoginMeta,
  ) {
    await this.users.touchLastLogin(user.id);
    const payload = this.buildPayload(user);
    const accessToken = this.signAccess(payload);
    const refreshToken = this.signRefresh(payload);
    await this.storeRefresh(user.id, refreshToken, meta);
    return { accessToken, refreshToken, user: this.publicUser(user) };
  }

  async login(dto: LoginDto, meta?: LoginMeta) {
    const user = await this.users.findByEmailWithPassword(dto.email);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // 1) e-mail ainda não verificado (auto-cadastro do frontend) → OTP por e-mail
    if (!user.emailVerified) {
      await this.sendOtp(user.email, OtpPurpose.EMAIL_VERIFICATION);
      return { requires2fa: true, email: user.email };
    }

    // 2) TOTP já ativo → exige código do autenticador
    if (user.totpEnabled) {
      return { status: 'TOTP_REQUIRED', totpToken: this.signTempToken(user.id, 'totp_challenge') };
    }

    // 3) SUPER_ADMIN é OBRIGADO a configurar TOTP (admin robusto, sem opção de pular)
    if (user.role === UserRole.SUPER_ADMIN) {
      return { status: 'TOTP_SETUP_REQUIRED', totpToken: this.signTempToken(user.id, 'totp_setup') };
    }

    // 4) usuário normal sem TOTP → entra direto
    return this.issueSession(user, meta);
  }

  // ---- TOTP durante o LOGIN (usa tokens temporários) ----

  /** Gera segredo + QR para enrolamento no login (não ativa ainda). */
  async totpSetup(setupToken: string) {
    const userId = this.verifyTempToken(setupToken, 'totp_setup');
    const user = await this.users.findById(userId);
    const secret = this.totp.generateSecret();
    await this.users.setTotpSecret(userId, this.crypto.encrypt(secret));
    const otpauthUrl = this.totp.buildOtpAuthUrl(user.email, secret);
    return { qrDataUrl: await this.totp.toQrDataUrl(otpauthUrl), secret, otpauthUrl };
  }

  /** Confirma o código e ATIVA o TOTP, já emitindo a sessão (login). */
  async totpEnableAtLogin(setupToken: string, code: string, meta?: LoginMeta) {
    const userId = this.verifyTempToken(setupToken, 'totp_setup');
    const user = await this.users.findById(userId);
    if (!user.totpSecret) throw new BadRequestException('Gere o QR antes de confirmar.');
    if (!this.totp.verify(this.crypto.decrypt(user.totpSecret), code)) {
      throw new UnauthorizedException('Código inválido.');
    }
    await this.users.setTotpEnabled(userId, true);
    user.totpEnabled = true;
    return this.issueSession(user, meta);
  }

  /** Verifica o código TOTP no login de quem já tem 2FA ativo. */
  async totpVerifyAtLogin(challengeToken: string, code: string, meta?: LoginMeta) {
    const userId = this.verifyTempToken(challengeToken, 'totp_challenge');
    const user = await this.users.findById(userId);
    if (!user.totpSecret || !user.totpEnabled) throw new UnauthorizedException('2FA não configurado.');
    if (!this.totp.verify(this.crypto.decrypt(user.totpSecret), code)) {
      throw new UnauthorizedException('Código inválido.');
    }
    return this.issueSession(user, meta);
  }

  // ---- TOTP autenticado (Configurações do frontend) ----

  /** Inicia o enrolamento de 2FA p/ um usuário logado (gera QR, não ativa). */
  async totpInit(userId: string) {
    const user = await this.users.findById(userId);
    if (user.totpEnabled) throw new BadRequestException('O 2FA já está ativo.');
    const secret = this.totp.generateSecret();
    await this.users.setTotpSecret(userId, this.crypto.encrypt(secret));
    const otpauthUrl = this.totp.buildOtpAuthUrl(user.email, secret);
    return { qrDataUrl: await this.totp.toQrDataUrl(otpauthUrl), secret, otpauthUrl };
  }

  /** Confirma o código e ativa o 2FA (usuário logado). */
  async totpConfirm(userId: string, code: string) {
    const user = await this.users.findById(userId);
    if (!user.totpSecret) throw new BadRequestException('Gere o QR primeiro.');
    if (!this.totp.verify(this.crypto.decrypt(user.totpSecret), code)) {
      throw new UnauthorizedException('Código inválido.');
    }
    await this.users.setTotpEnabled(userId, true);
    return { totpEnabled: true };
  }

  /** Desativa o 2FA (usuário logado). SUPER_ADMIN não pode desativar. */
  async totpDisable(userId: string, code: string) {
    const user = await this.users.findById(userId);
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('O 2FA é obrigatório para administradores.');
    }
    if (!user.totpEnabled || !user.totpSecret) return { totpEnabled: false };
    if (!this.totp.verify(this.crypto.decrypt(user.totpSecret), code)) {
      throw new UnauthorizedException('Código inválido.');
    }
    await this.users.setTotpEnabled(userId, false);
    await this.users.setTotpSecret(userId, null);
    return { totpEnabled: false };
  }

  publicUser(u: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string | null;
    emailVerified: boolean;
    totpEnabled?: boolean;
  }) {
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      organizationId: u.organizationId,
      emailVerified: u.emailVerified,
      totpEnabled: !!u.totpEnabled,
    };
  }

  async refresh(token: string, meta?: { ip?: string; userAgent?: string }) {
    let payload: any;
    try {
      payload = this.jwt.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const hash = this.hash(token);
    const stored = await this.refreshRepo.findOne({
      where: { userId: payload.sub, tokenHash: hash, revoked: false, expiresAt: MoreThan(new Date()) },
    });
    if (!stored) throw new UnauthorizedException('Refresh token expired or revoked');
    stored.revoked = true;
    await this.refreshRepo.save(stored);

    const user = await this.users.findById(payload.sub);
    const newPayload = this.buildPayload(user);
    const accessToken = this.signAccess(newPayload);
    const refreshToken = this.signRefresh(newPayload);
    await this.storeRefresh(user.id, refreshToken, meta);
    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    await this.refreshRepo.update({ userId, revoked: false }, { revoked: true });
    return { ok: true };
  }

  async sendOtp(email: string, purpose: OtpPurpose = OtpPurpose.TWO_FACTOR) {
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) return { ok: true };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = this.hash(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.otpRepo.save(this.otpRepo.create({ userId: user.id, codeHash, purpose, expiresAt }));
    await this.mail.sendOtp(user.email, code);
    return { ok: true };
  }

  async verifyOtp(email: string, code: string, meta?: { ip?: string; userAgent?: string }) {
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Invalid code');
    const codeHash = this.hash(code);
    const otp = await this.otpRepo.findOne({
      where: { userId: user.id, codeHash, used: false, expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });
    if (!otp) throw new UnauthorizedException('Invalid or expired code');
    otp.used = true;
    await this.otpRepo.save(otp);

    if (otp.purpose === OtpPurpose.EMAIL_VERIFICATION) {
      await this.users.markEmailVerified(user.id);
      user.emailVerified = true;
    }
    await this.users.touchLastLogin(user.id);
    const payload = this.buildPayload(user);
    const accessToken = this.signAccess(payload);
    const refreshToken = this.signRefresh(payload);
    await this.storeRefresh(user.id, refreshToken, meta);
    return { accessToken, refreshToken, user: this.publicUser(user) };
  }

  async forgotPassword(email: string) {
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) return { ok: true };
    const token = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 8);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.resetRepo.save(this.resetRepo.create({ userId: user.id, tokenHash, expiresAt }));
    const url = `${process.env.APP_PUBLIC_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await this.mail.sendPasswordReset(user.email, url);
    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const candidates = await this.resetRepo.find({
      where: { used: false, expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    for (const pr of candidates) {
      if (await bcrypt.compare(dto.token, pr.tokenHash)) {
        pr.used = true;
        await this.resetRepo.save(pr);
        await this.users.setPassword(pr.userId, dto.newPassword);
        return { ok: true };
      }
    }
    throw new BadRequestException('Invalid or expired token');
  }
}
