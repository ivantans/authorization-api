import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator"

export class RegisterDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string

  // @IsStrongPassword({ minLength: 8, minLowercase: 1, minNumbers: 1, minSymbols: 1, minUppercase: 1 })
  @IsNotEmpty()
  @IsString()
  password: string
}