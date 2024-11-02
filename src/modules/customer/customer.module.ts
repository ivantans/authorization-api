import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { AuthMiddleware } from 'src/common/middleware/auth/auth.middleware';
import { JwtConfigModule } from 'src/config/jwt-config/jwt-config.module';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
  imports: [JwtConfigModule, PrismaModule],
  controllers: [CustomerController],
  providers: [CustomerService]
})
export class CustomerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: "/customer",
      version: "1",
      method: RequestMethod.ALL
    })
  }
}
