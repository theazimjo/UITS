import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { StudentStatus } from '../enums/student-status.enum';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  schoolName?: string;

  @IsString()
  @IsOptional()
  classroom?: string;

  @IsString()
  @IsOptional()
  parentName?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
