import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class RegisterDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({ minLength: 8, minLowercase: 1, minSymbols: 1, minNumbers: 1, minUppercase: 1 })
  password: string
}