import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  // Token do Cloudflare Turnstile (captcha). Validado pelo TurnstileGuard.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  captchaToken?: string;
}
