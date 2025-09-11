import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserSession } from 'src/user/entities/user_session.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession]),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET || 'THIS_IS_JWT_SRCRET!@',
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES || '1d',
        },
      }),
      global: true,
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
