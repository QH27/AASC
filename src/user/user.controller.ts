import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RefeshTokenDto } from 'src/user/dto/refesh-token.dto';
import { UserSignUpDto } from 'src/user/dto/user-signup.dto';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { UserService } from 'src/user/user.service';
import { DataSource } from 'typeorm';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import type { CurrentUserDto } from 'src/decorators/current-user.decorator';
import { UserSignInDto } from 'src/user/dto/user-signin.dto';
import { IncomingMessage } from 'node:http';
import { FastifyRequest } from 'fastify';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private dataSource: DataSource,
  ) {}

  @Post('auth/signUp')
  async signUp(@Body() userSignUpDto: UserSignUpDto) {
    return await this.userService.signUp(userSignUpDto);
  }

  @Post('auth/signIn')
  async signIn(
    @Body() data: UserSignInDto,
    @Request() req: IncomingMessage | FastifyRequest,
  ) {
    try {
      const result = await this.userService.signIn(
        data.username,
        data.password,
        req.headers['user-agent'] || 'No-User-Agent-' + Date.now(),
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async profile(@CurrentUser() currentUser: CurrentUserDto) {
    try {
      return this.dataSource.transaction(async () => {
        return this.userService.getCustomerProfile(currentUser.id);
      });
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('refresh-token')
  async refeshToken(@Body() body: RefeshTokenDto) {
    try {
      const payload = await this.userService.handleRefreshToken(body);
      return payload;
    } catch (error) {
      console.log(error);
    }
  }
}
