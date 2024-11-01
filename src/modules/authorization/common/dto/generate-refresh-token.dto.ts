import { IsString } from "class-validator";

export class GenerateRefreshTokenDto{
  @IsString()
  refreshToken: string
}