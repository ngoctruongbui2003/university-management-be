import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { config } from 'src/shared/config';
import { UserService } from 'src/modules/user/user.service';
import { ErrorMessages } from 'src/shared/constants/error-messages.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.jwt.secret,
        });
    }

    async validate(payload: any) {
        const user = await this.userService.findOne(payload.sub);
        
        if (!user) throw new UnauthorizedException(ErrorMessages.USER.NOT_FOUND);
        return {
            userId: payload.sub,
            username: payload.username,
        };
    }
}
