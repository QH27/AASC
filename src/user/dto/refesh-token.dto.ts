import { IsNotEmpty, IsString } from 'class-validator';

export class RefeshTokenDto {
  @IsNotEmpty()
  @IsString()
  refeshToken: string;
}
