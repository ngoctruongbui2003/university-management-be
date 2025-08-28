import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file from project root
dotenv.config({ path: resolve(__dirname, '../../.env') });

export const config = {
    port: process.env.PORT || 3000,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USERNAME || 'user',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'database',
        typeOrmSynchronize: process.env.TYPEORM_SYNCHRONIZE || false,
        typeOrmLogging: process.env.TYPEORM_LOGGING || false,
    },
    jwt: {
        secret: process.env.JWT_SECRET || "",
        expiresInAccess: process.env.JWT_EXPIRES_IN_ACCESS || '1h',
        expiresInRefresh: process.env.JWT_EXPIRES_IN_REFRESH || '7d',
    },
    minio: {
        endPoint: process.env.MINIO_ENDPOINT || '103.56.162.192',
        port: parseInt(process.env.MINIO_PORT) || 9990,
        useSSL: process.env.MINIO_USE_SSL === 'true' || false,
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        bucketName: process.env.MINIO_BUCKET_NAME || 'university-files',
    }
}
