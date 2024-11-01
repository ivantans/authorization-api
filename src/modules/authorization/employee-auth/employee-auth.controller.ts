import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { EmployeeAuthService } from './employee-auth.service';
import { UserAgentRequest } from 'src/common/interface/user-agent-request.interface';
import { ApiResponse } from 'src/common/interface/api-response.interface';
import { LoginResponse } from './interface/login-response.interface';
import { RegisterDto } from './dto/register.dto';
import { EmployeeData } from './interface/employee-data.interface';
import { loginDto } from '../common/dto/login.dto';
import { RefreshTokenDto } from '../common/dto/refresh-token.dto';
import { AccessTokenData } from '../common/interface/access-token-data.interface';

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
  async refreshToken(
    @Req() req: UserAgentRequest,
    @Body() refreshTokenDto: RefreshTokenDto
  ): Promise<ApiResponse<AccessTokenData>> {
    try {
      const newAccessToken = await this.employeeAuthService.refreshToken(req, refreshTokenDto);
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

  @Post("register")
  @HttpCode(200)
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<EmployeeData>> {
    try {
      const newEmployee = await this.employeeAuthService.register(registerDto);
      return {
        statusCode: HttpStatus.OK,
        statusMessage: HttpStatus[200],
        message: "Register Success",
        data: newEmployee
      }
    } catch (e) {
      throw e;
    }
  }
}
