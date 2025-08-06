import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { DatabaseLoggerService } from './shared/components/db/db.logger.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AcademicYearModule } from './modules/academic-year/academic-year.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { GradingFormulasModule } from './modules/grading-formulas/grading-formulas.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { CurriculumsModule } from './modules/curriculums/curriculums.module';
import { MajorModule } from './modules/major/major.module';
import { ClassesModule } from './modules/classes/classes.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    AuthModule,
    UserModule,
    AcademicYearModule,
    FacultyModule,
    GradingFormulasModule,
    SubjectsModule,
    CurriculumsModule,
    MajorModule,
    ClassesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseLoggerService,
  ],
})
export class AppModule {}
