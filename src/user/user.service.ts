import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSignUpDto } from 'src/user/dto/user-signup.dto';
import { User } from 'src/user/entities/user.entity';
import { UserSession } from 'src/user/entities/user_session.entity';
import { EntityManager, Raw, Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { TokenPayload } from 'src/user/guard/auth.guard';
import { RefeshTokenDto } from 'src/user/dto/refesh-token.dto';
import { TimeConstants } from 'src/enums/app.enums';
import md5 from 'md5';
import { DateTime } from 'luxon';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepo: Repository<UserSession>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: UserSignUpDto): Promise<User> {
    try {
      const hashPwd = await hash(createUserDto.password, 10);
      const user = this.userRepo.create({
        ...createUserDto,
        password: hashPwd,
      });

      return await this.userRepo.save(user);
    } catch (error) {
      throw new BadRequestException('Create customer failed');
    }
  }

  async findUserByEmail(email: string) {
    return await this.userRepo.findOneBy({ email });
  }

  async signUp(user: UserSignUpDto) {
    const userExist = await this.findUserByEmail(user.email);

    if (userExist) {
      throw new BadRequestException('Email không khả thi.');
    }

    return this.createUser(user);
  }

  async createToken(payload: TokenPayload, createRefresh = true) {
    const accessToken = await this.jwtService.signAsync(payload);
    const expiresIn = process.env.JWT_REFESH_EXPIRES || '1d';
    const refreshToken = createRefresh
      ? await this.jwtService.signAsync(payload, {
          secret:
            process.env.JWT_REFESH_SECRET || 'THIS_IS_JWT_REFESH_SRCRET!@',
          expiresIn,
        })
      : undefined;
    return { accessToken, refreshToken };
  }

  async handleRefreshToken(
    refeshTokenDto: RefeshTokenDto,
    manager?: EntityManager,
  ) {
    if (!manager) {
      manager = this.userSessionRepo.manager;
    }

    try {
      const verify = await this.jwtService.verifyAsync<TokenPayload>(
        refeshTokenDto.refeshToken,
        {
          secret:
            process.env.JWT_REFESH_SECRET || 'THIS_IS_JWT_REFESH_SRCRET!@',
        },
      );
      const session = await this.userSessionRepo.findOneBy({
        refreshToken: refeshTokenDto.refeshToken,
      });
      if (!session) {
        throw new Error('REFRESH_TOKEN_NOT_FOUND');
      }

      const payload = session.tokenPayload;
      if (
        payload?.username != verify.username ||
        payload.password != verify.password
      ) {
        throw new Error('REFRESH_TOKEN_INVALID');
      }

      const shouldCreateRefreshToken =
        session.expireTime === 0 ||
        session.expireTime >= Date.now() / 1000 - TimeConstants.One_Day;
      const { accessToken, refreshToken } = await this.createToken(
        payload,
        shouldCreateRefreshToken,
      );
      if (refreshToken) {
        session.refreshToken = refreshToken;
      }
      session.expireTime = Date.now() / 1000 + 3000;
      await this.userSessionRepo.save(session);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error('REFESH_TOKEN_IS_NOT_VALIDATE');
    }
  }

  async signIn(username: string, password: string, userAgent: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new Error('INVALID_PASSWORD');
    }

    const payload: TokenPayload = {
      username: user.username,
      id: user.id,
      password: user.password,
    };

    const dateSeconds = DateTime.now().startOf('day').toSeconds();
    const sessionId = md5(
      `${password}-${username}-${userAgent}-${dateSeconds}`,
    );
    const expireTime = Math.floor(Date.now() / 1000) + 3000;
    const result = await this.createToken(payload);

    let session = await this.userSessionRepo.findOneBy({
      userId: user.id,
      expireTime: Raw((col) => `(${col} = 0 OR ${col} > strftime('%s','now'))`),
    });

    if (session) {
      if (session.expireTime > 0 && session.expireTime < Date.now() / 1000) {
        throw new Error('SESSION_EXPIRED');
      }

      session.refreshToken = result.refreshToken;
      session.expireTime = expireTime;
    } else {
      session = new UserSession({
        id: sessionId,
        userId: user.id,
        tokenPayload: payload,
        refreshToken: result.refreshToken,
        expireTime,
      });
    }

    await this.userSessionRepo.save(session);
    return result;
  }

  async getCustomerProfile(userId) {
    const query = await this.userRepo
      .createQueryBuilder('user')
      .select(['user.id', 'user.nickname', 'user.email', 'user.username'])
      .innerJoin(UserSession, 'userSession', 'userSession.user_id = user.id')
      .where('user.id = :userId', { userId })
      .getOne();
    return query;
  }
}
