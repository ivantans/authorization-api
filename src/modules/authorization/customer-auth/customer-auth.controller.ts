import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import { ApiResponse } from 'src/common/interface/api-response.interface';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) { }
  @Post("login")
  @HttpCode(200)
  async login(): Promise<ApiResponse<>> {
    try {
    } catch (e) {
      throw e
    }
  }
  @Post("refresh-token")
  @HttpCode(200)
  async generateRefreshToken(): Promise<ApiResponse<>> {
    try {
    }
    catch (e) {
      throw e;
    }
  }

  @Post("register")
  @HttpCode(200)
  async register(): Promise<ApiResponse<>> {
    try {
    } catch (e) {
      throw e;
    }
  }
}
