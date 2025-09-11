import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class UserSignInDto {
  @ApiProperty({ required: false })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống.' })
  username: string;

  @ApiProperty({ required: false })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(5, { message: 'Mật khẩu không ít hơn 5 ký tự.' })
  password: string;
}
