import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IncomingMessage } from 'node:http';

export interface CurrentUserDto {
  id: number;
  username: string;
  email: string;
}

export type CurrentUserRequest<T> = T & {
  currentUser?: CurrentUserDto;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx
      .switchToHttp()
      .getRequest<CurrentUserRequest<IncomingMessage | FastifyRequest>>();

    return req.currentUser;
  },
);
