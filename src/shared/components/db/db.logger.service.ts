import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseLoggerService implements OnModuleInit {
    private readonly logger = new Logger(DatabaseLoggerService.name);

    constructor(private readonly dataSource: DataSource) {}

    async onModuleInit() {
        try {
            this.logger.log('🔄 Connecting to MariaDB...');

            if (!this.dataSource.isInitialized) {
                await this.dataSource.initialize();
            }

            this.logger.log('✅ Connected to MariaDB!');
        } catch (error) {
            this.logger.error('❌ Failed to connect to MariaDB:', error);
        }
    }

    async onModuleDestroy() {
        await this.dataSource.destroy();
        this.logger.log('🛑 Disconnected from MariaDB');
    }
}
