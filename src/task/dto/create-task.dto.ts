import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Title không được để trống' })
  @IsString({ message: 'Title phải là chuỗi' })
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Description phải là chuỗi' })
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  status?: number;
}
