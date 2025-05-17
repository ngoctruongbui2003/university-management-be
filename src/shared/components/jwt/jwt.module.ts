// jwt.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { config } from '../../../shared/config';
import { JwtSharedService } from './jwt.service';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: config.jwt.secret,
            signOptions: { expiresIn: config.jwt.expiresInAccess },
        })
    ],
    providers: [JwtSharedService],
    exports: [JwtModule, JwtSharedService],
})
export class JwtSharedModule {}

