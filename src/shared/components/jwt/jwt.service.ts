// jwt.shared.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from '../../../shared/config';

@Injectable()
export class JwtSharedService {
    constructor(private readonly jwtService: JwtService) {}

    async generateTokens(payload: any) {
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: config.jwt.expiresInAccess,
        });
        const refreshToken = await this.jwtService.signAsync(payload, { 
            expiresIn: config.jwt.expiresInRefresh 
        });

        return {
            accessToken,
            refreshToken,
        };
    }
}
