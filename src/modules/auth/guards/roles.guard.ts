// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from 'src/shared/constants/enum';
import { ErrorMessages } from 'src/shared/constants/error-messages.constant';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly userService: UserService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) return true;

        const request = context.switchToHttp().getRequest();
        const { user } = request;

        if (!user?.userId) {
            throw new ForbiddenException(ErrorMessages.AUTH.FORBIDDEN);
        }

        // Lấy user kèm role từ DB
        const userFromDb = await this.userService.findOneWithRole(user.userId);

        if (!userFromDb?.role?.name) {
            throw new ForbiddenException(ErrorMessages.AUTH.FORBIDDEN);
        }

        const hasRole = requiredRoles.includes(userFromDb.role.name);

        if (!hasRole) {
            throw new ForbiddenException(ErrorMessages.AUTH.FORBIDDEN);
        }

        return true;
    }
}