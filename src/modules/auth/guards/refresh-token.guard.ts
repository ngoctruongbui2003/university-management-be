import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorMessages } from 'src/shared/constants/error-messages.constant';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const refreshToken = req.body.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException(ErrorMessages.AUTH.REFRESH_TOKEN_NOT_FOUND);
        }

        try {
            const decoded = await this.jwtService.verifyAsync(refreshToken);
            if (!decoded || !decoded.sub) {
                throw new UnauthorizedException(ErrorMessages.AUTH.REFRESH_TOKEN_FAIL);
            }
            req.user = { id: decoded.sub };
            return true;
        } catch (error) {
            throw new UnauthorizedException(ErrorMessages.AUTH.REFRESH_TOKEN_FAIL);
        }
    }
}
