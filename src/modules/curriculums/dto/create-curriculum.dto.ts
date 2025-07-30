import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ======= CurriculumInfo =======

export class CurriculumInfoDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  academicYear: string;

  @IsString()
  facultyId: string;

  @IsString()
  majorId: string;

  @IsNumber()
  totalCredits: number;

  @IsDateString()
  createdAt: string;
}

// ======= SemesterColumn =======
export class SemesterColumnDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsArray()
  @IsInt({ each: true })
  subjectIds: number[];

  @IsString()
  curriculumTypeId: string;

  @IsInt()
  semesterNumber: number;
}

// ======= Board (CurriculumConnect) =======
export class BoardDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  curriculumId: string;

  @IsString()
  curriculumTypeId: string;

  @IsArray()
  @IsString({ each: true })
  columnOrder: string[];

  @IsObject()
  semesterColumn: Record<string, SemesterColumnDto>;
}

// ======= PrerequisiteSubject =======
export class PrerequisiteSubjectDto {
  @IsString()
  id: string;

  @IsString()
  subjectId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  majorId: string;

  @IsInt()
  faculty_id: number;

  @IsInt()
  credits: number;
}

// ======= Subject =======
export class SubjectDto {
  @IsInt()
  SubjectID: number;

  @IsString()
  MajorID: string;

  @IsInt()
  Semester: number;

  @IsBoolean()
  IsRequired: boolean;

  @IsInt()
  MinCredit: number;

  @IsBoolean()
  HasPrerequisite: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrerequisiteSubjectDto)
  PrerequisiteSubjects: PrerequisiteSubjectDto[];
}

// ======= Final Root DTO =======
export class CreateCurriculumDto {
  @ValidateNested()
  @Type(() => CurriculumInfoDto)
  curriculumInfo: CurriculumInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoardDto)
  boards: BoardDto[];

  @IsObject()
  subjects: Record<string, SubjectDto>;
}
