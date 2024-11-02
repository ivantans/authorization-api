import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10
    }])
  ],
  exports: [ThrottlerModule]
})
export class ThrottlerConfigModule { }
