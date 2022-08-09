import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/user/entities/user.entity';

export type AllowRoles = keyof typeof UserRoles | 'Any';

export const Roles = (...roles: AllowRoles[]) => SetMetadata('roles', roles);
