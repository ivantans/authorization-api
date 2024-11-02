import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import { ApiResponse } from 'src/common/interface/api-response.interface';
import { loginDto } from '../common/dto/login.dto';
import { LoginResponse } from './interface/login-response.interface';
import { UserAgentRequest } from 'src/common/interface/user-agent-request.interface';
import { RefreshTokenDto } from '../common/dto/refresh-token.dto';
import { AccessTokenData } from '../common/interface/access-token-data.interface';
import { RegisterDto } from './dto/register.dto';
import { UnverifiedCustomerData } from './interface/unverified-customer-data.interface';
import { Throttle } from '@nestjs/throttler';
import { ResendVerificationLinkDto } from './dto/resend-verification-link-dto';

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
  @Throttle({default : {limit: 1, ttl: 60000}})
  @Post("register")
  @HttpCode(202)
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<UnverifiedCustomerData>> {
    try {
      const response = await this.customerAuthService.register(registerDto);
      return {
        statusCode: HttpStatus.ACCEPTED,
        statusMessage: HttpStatus[202],
        message: "Registration successful! Please check your email to verify your account.",
        data: response
      }
    } catch (e) {
      throw e;
    }
  }

  @Get("verify-email")
  @HttpCode(200)
  async verifyEmail(@Query("token") token: string): Promise<ApiResponse<null>> {
    try {
      const response = await this.customerAuthService.verifyEmail(token);
      return {
        statusCode: HttpStatus.OK,
        statusMessage: HttpStatus[200],
        message: "Email verified successfully. Your account is now active.",
      }
    } catch (e) {
      throw e
    }
  }

  @Throttle({default: {limit: 1, ttl: 60000}})
  @Post("resend-verification")
  async resendVerificationLink(@Body() resendVerificationLinkDto: ResendVerificationLinkDto) {
    try {
      const response = await this.customerAuthService.resendVerificationLink(resendVerificationLinkDto);
      return {
        statusCode: HttpStatus.OK,
        statusMessage: HttpStatus[200],
        message: "Verification email has been resent. Please check your inbox.",
      }
    } catch (e) {
      throw e;
    }
  }
}
