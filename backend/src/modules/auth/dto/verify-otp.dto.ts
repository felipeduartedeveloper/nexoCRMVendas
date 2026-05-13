import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty()
  @IsString()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty({ minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6)
  code: string;
}
