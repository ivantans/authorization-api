import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { JwtConfigModule } from 'src/config/jwt-config/jwt-config.module';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { UserAgentMiddleware } from 'src/common/middleware/user-agent/user-agent.middleware';

@Module({
  imports: [JwtConfigModule, PrismaModule],
  providers: [CustomerAuthService],
  controllers: [CustomerAuthController]
})
export class CustomerAuthModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAgentMiddleware).forRoutes({
      path: "customer-auth/login",
      version: "1",
      method: RequestMethod.POST
    })
  }
}
