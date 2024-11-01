import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import { ApiResponse } from 'src/common/interface/api-response.interface';
import { loginDto } from '../common/dto/login.dto';
import { LoginResponse } from './interface/login-response.interface';
import { UserAgentRequest } from 'src/common/interface/user-agent-request.interface';
import { RefreshTokenDto } from '../common/dto/refresh-token.dto';
import { AccessTokenData } from '../common/interface/access-token-data.interface';

@Controller({
  path: "customer-auth",
  version: "1",
})
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) { }
  @Post("login")
  @HttpCode(200)
  async login(@Req() req: UserAgentRequest, @Body() loginDto: loginDto): Promise<ApiResponse<LoginResponse>> {
    try {
      const validatedCustomer = await this.customerAuthService.validate(loginDto);
      const generateSession = await this.customerAuthService.generateSession(req, validatedCustomer);
      return {
        statusCode: HttpStatus.OK,
        statusMessage: HttpStatus[200],
        message: "Login Success",
        data: {
          user: validatedCustomer,
          auth: generateSession
        }
      }
    } catch (e) {
      throw e
    }
  }
  @Post("refresh-token")
  @HttpCode(200)
  async refreshToken(@Req() req: UserAgentRequest, @Body() refreshTokenDto: RefreshTokenDto): Promise<ApiResponse<AccessTokenData>> {
    try {
      const newAccessToken = await this.customerAuthService.refreshToken(req, refreshTokenDto);
      return {
        statusCode: HttpStatus.OK,
        statusMessage: HttpStatus[200],
        message: "Refresh Token Success",
        data: newAccessToken
      }
    }
    catch (e) {
      throw e;
    }
  }

  // @Post("register")
  // @HttpCode(200)
  // async register(): Promise<ApiResponse<>> {
  //   try {
  //   } catch (e) {
  //     throw e;
  //   }
  // }
}
