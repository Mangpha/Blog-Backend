import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { UserService } from 'src/user/user.service';
import { AllowRoles } from './roles.decorator';

interface JwtPayload {
  id: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<AllowRoles[]>(
      'roles',
      context.getHandler(),
    );
    if (!roles) return true;
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;
    if (token) {
      const verify = this.jwtService.verify(token) as JwtPayload;
      if (typeof verify === 'object' && verify.hasOwnProperty('id')) {
        const { user } = await this.userService.findById(verify.id);
        if (!user) return false;
        gqlContext['user'] = user;
        if (roles.includes('Any')) return true;
        return roles.includes(user.role);
      } else return false;
    } else return false;
  }
}
