import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtConfigModule } from 'src/config/jwt-config/jwt-config.module';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { EmployeeAuthService } from './employee-auth.service';
import { EmployeeAuthController } from './employee-auth.controller';
import { UserAgentMiddleware } from 'src/common/middleware/user-agent/user-agent.middleware';

@Module({
  imports: [PrismaModule, JwtConfigModule],
  providers: [EmployeeAuthService],
  controllers: [EmployeeAuthController]
})
export class EmployeeAuthModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAgentMiddleware).forRoutes({
      path: "employee-auth/login",
      version: "1",
      method: RequestMethod.POST
    })
  }
}
