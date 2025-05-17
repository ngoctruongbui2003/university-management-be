import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { LoggerOptions } from 'typeorm';

export default class TypeOrmConfig {
    static getOrmConfig(configService: ConfigService): TypeOrmModuleOptions {
        return {
            type: 'mariadb',
            host: configService.get('DB_HOST'),
            port: Number(configService.get('DB_PORT')),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
            entities: [__dirname + '/../entities/*{.entity.ts,.entity.js}'],
            synchronize: configService.get<boolean>('TYPEORM_SYNCHRONIZE'),
            logging: configService.get<LoggerOptions>('TYPEORM_LOGGING'),
        };
    }
}

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> =>
        TypeOrmConfig.getOrmConfig(configService),
    inject: [ConfigService],
};
