import { Module } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';

@Module({
  providers: [CustomerAuthService],
  controllers: [CustomerAuthController]
})
export class CustomerAuthModule {}
