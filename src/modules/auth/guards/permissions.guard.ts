import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly userService: UserService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler());
        if (!requiredPermissions) return true;

        const request = context.switchToHttp().getRequest();
        const userPayload = request.user;
        const user = await this.userService.findOneWithRolePermissions(userPayload.userId);

        if (!user || !user.role || !user.role.permissions) return false;

        const rolePermissions = user.role.permissions.map(p => p.name);
        return requiredPermissions.every(p => rolePermissions.includes(p));
    }
}
