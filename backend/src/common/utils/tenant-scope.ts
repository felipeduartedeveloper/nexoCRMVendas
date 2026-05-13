import { SelectQueryBuilder } from 'typeorm';
import { CurrentUserPayload } from '../decorators/current-user.decorator';
import { UserRole } from '../enums/user-role.enum';

export const isSuperAdmin = (user?: CurrentUserPayload | null): boolean =>
  user?.role === UserRole.SUPER_ADMIN;

export function applyOrgScope<T>(
  qb: SelectQueryBuilder<T>,
  user: CurrentUserPayload | null | undefined,
  alias: string,
): SelectQueryBuilder<T> {
  if (!user || isSuperAdmin(user)) return qb;
  if (!user.organizationId) {
    qb.andWhere('1 = 0');
    return qb;
  }
  qb.andWhere(`${alias}.organizationId = :__orgId`, { __orgId: user.organizationId });
  return qb;
}
