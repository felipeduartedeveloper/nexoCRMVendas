import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string | null;
  iat?: number;
  exp?: number;
}

export const CurrentUser = createParamDecorator<keyof CurrentUserPayload | undefined>(
  (data, ctx: ExecutionContext): CurrentUserPayload | string | number | null => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as CurrentUserPayload | undefined;
    if (!user) return null;
    if (data) {
      const v = user[data];
      return v === undefined ? null : v;
    }
    return user;
  },
);

export const CurrentOrg = createParamDecorator<undefined>((_, ctx: ExecutionContext): string | null => {
  const req = ctx.switchToHttp().getRequest();
  return req.user?.organizationId ?? null;
});
