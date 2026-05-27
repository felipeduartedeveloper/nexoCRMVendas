import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength } from 'class-validator';

/** Gera o QR/segredo durante o login forçado (token de setup). */
export class TotpSetupDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  token: string;
}

/** Confirma e ATIVA o TOTP durante o login (token de setup + código). */
export class TotpEnableDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  token: string;

  @ApiProperty({ minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6)
  code: string;
}

/** Verifica o código TOTP no login (token de challenge + código). */
export class TotpVerifyDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  token: string;

  @ApiProperty({ minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6)
  code: string;
}

/** Código de 6 dígitos para ações autenticadas (confirmar/desativar nas configs). */
export class TotpCodeDto {
  @ApiProperty({ minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6)
  code: string;
}
