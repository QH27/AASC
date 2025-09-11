import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignUpDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @MinLength(5, { message: 'Mật khẩu không ít hơn 5 ký tự.' })
  password: string;
}
