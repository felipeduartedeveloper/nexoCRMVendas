import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RequestOtpDto, VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-reset.dto';
import { TotpSetupDto, TotpEnableDto, TotpVerifyDto, TotpCodeDto } from './dto/totp.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { TurnstileGuard } from './guards/turnstile.guard';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  private meta(req: Request) {
    return {
      ip: (req.ip || req.headers['x-forwarded-for']?.toString() || '').slice(0, 64),
      userAgent: req.headers['user-agent']?.slice(0, 256),
    };
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @UseGuards(TurnstileGuard)
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, this.meta(req));
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.auth.refresh(dto.refreshToken, this.meta(req));
  }

  @ApiBearerAuth()
  @Post('logout')
  logout(@CurrentUser() user: CurrentUserPayload) {
    return this.auth.logout(user.sub);
  }

  // ---- 2FA TOTP no login (token temporário) ----
  @Public()
  @Post('totp/setup')
  totpSetup(@Body() dto: TotpSetupDto) {
    return this.auth.totpSetup(dto.token);
  }

  @Public()
  @Post('totp/enable')
  totpEnable(@Body() dto: TotpEnableDto, @Req() req: Request) {
    return this.auth.totpEnableAtLogin(dto.token, dto.code, this.meta(req));
  }

  @Public()
  @Post('totp/verify')
  totpVerify(@Body() dto: TotpVerifyDto, @Req() req: Request) {
    return this.auth.totpVerifyAtLogin(dto.token, dto.code, this.meta(req));
  }

  // ---- 2FA TOTP autenticado (Configurações) ----
  @ApiBearerAuth()
  @Post('totp/init')
  totpInit(@CurrentUser() user: CurrentUserPayload) {
    return this.auth.totpInit(user.sub);
  }

  @ApiBearerAuth()
  @Post('totp/confirm')
  totpConfirm(@CurrentUser() user: CurrentUserPayload, @Body() dto: TotpCodeDto) {
    return this.auth.totpConfirm(user.sub, dto.code);
  }

  @ApiBearerAuth()
  @Post('totp/disable')
  totpDisable(@CurrentUser() user: CurrentUserPayload, @Body() dto: TotpCodeDto) {
    return this.auth.totpDisable(user.sub, dto.code);
  }

  // ---- 2FA por e-mail (Configurações) ----
  @ApiBearerAuth()
  @Post('email-2fa/enable')
  emailOtpEnable(@CurrentUser() user: CurrentUserPayload) {
    return this.auth.enableEmailOtp(user.sub);
  }

  @ApiBearerAuth()
  @Post('email-2fa/disable')
  emailOtpDisable(@CurrentUser() user: CurrentUserPayload) {
    return this.auth.disableEmailOtp(user.sub);
  }

  // ---- OTP por e-mail (verificação de e-mail / recuperação) ----
  @Public()
  @Post('2fa/request')
  request2fa(@Body() dto: RequestOtpDto) {
    return this.auth.sendOtp(dto.email);
  }

  @Public()
  @Post('2fa/verify')
  verify2fa(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    return this.auth.verifyOtp(dto.email, dto.code, this.meta(req));
  }

  @Public()
  @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  reset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.users.findById(user.sub);
  }
}
