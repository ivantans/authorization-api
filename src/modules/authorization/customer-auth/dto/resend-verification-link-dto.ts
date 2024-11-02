import { IsEmail, IsNotEmpty } from "class-validator";

export class ResendVerificationLinkDto {
  @IsEmail()
  @IsNotEmpty()
  @IsEmail()
  email: string
}