import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ErrorMessages } from 'src/shared/constants/error-messages.constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException(ErrorMessages.AUTH.AUTH_HEADER_INVALID);
        }

        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        if (err || !user) {
            if (info?.name === 'TokenExpiredError') {
                throw new UnauthorizedException(ErrorMessages.AUTH.ACCESS_TOKEN_EXPIRED);
            }
    
            if (info?.name === 'JsonWebTokenError') {
                throw new UnauthorizedException(ErrorMessages.AUTH.ACCESS_TOKEN_INVALID);
            }
    
            throw new UnauthorizedException(ErrorMessages.AUTH.ACCESS_TOKEN_FAIL);
        }
        return user;
    }
    
}
