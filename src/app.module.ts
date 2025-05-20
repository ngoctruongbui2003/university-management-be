import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { DatabaseLoggerService } from './shared/components/db/db.logger.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { AcademicYearModule } from './modules/academic-year/academic-year.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { GradingFormulasModule } from './modules/grading-formulas/grading-formulas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    AcademicYearModule,
    FacultyModule,
    GradingFormulasModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseLoggerService,
  ],
})
export class AppModule {}
