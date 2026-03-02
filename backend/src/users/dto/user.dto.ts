import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../shared/interfaces';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(['employee', 'admin'])
  role: UserRole;

  @IsOptional()
  @IsString()
  clerkUserId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['employee', 'admin'])
  role?: UserRole;
}
