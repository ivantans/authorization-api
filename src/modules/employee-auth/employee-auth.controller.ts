import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { EmployeeAuthService } from './employee-auth.service';
import { UserAgentRequest } from 'src/common/interface/user-agent-request.interface';
import { loginDto } from 'src/common/dto/login.dto';
import { ApiResponse } from 'src/common/interface/api-response.interface';
import { LoginResponse } from './interface/login-response.interface';
import { GenerateRefreshTokenDto } from './dto/generate-refresh-token.dto';
import { AccessTokenData } from './interface/access-token-data.interface';

@Controller({
  version: "1",
  path: "employee-auth"
})
export class EmployeeAuthController {
  constructor(private readonly employeeAuthService: EmployeeAuthService) { }
  @Post("login")
  @HttpCode(200)
  async login(@Req() req: UserAgentRequest, @Body() loginDto: loginDto): Promise<ApiResponse<LoginResponse>> {
    try {
      const validatedEmployee = await this.employeeAuthService.validate(loginDto);
      const generateSession = await this.employeeAuthService.generateSession(req, validatedEmployee);
      return {
        statusCode: HttpStatus.OK,
        statusMessage: HttpStatus[200],
        message: "Login Success",
        data: {
          user: validatedEmployee,
          auth: generateSession
        }
      }
    } catch (e) {
      throw e
    }
  }
  @Post("refresh-token")
  @HttpCode(200)
  async generateRefreshToken(
    @Req() req: UserAgentRequest,
    @Body() generateRefreshTokenDto: GenerateRefreshTokenDto
  ): Promise<ApiResponse<AccessTokenData>> {
    try {
      const newAccessToken = await this.employeeAuthService.generateRefreshToken(req, generateRefreshTokenDto);
      return {
        statusCode: HttpStatus.OK,
        statusMessage: HttpStatus[200],
        message: "Login Success",
        data: newAccessToken
      }
    }
    catch (e) {
      console.error(e)
      throw e;
    }
  }

  async register() {
    try {
      
    } catch (e) {
      throw e;
    }
  }
}
