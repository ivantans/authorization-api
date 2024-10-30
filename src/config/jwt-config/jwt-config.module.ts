import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>("JWT_SECRET"),
			}),
		})
	],
	providers: [JwtConfigModule],
	exports: [JwtModule]
})
export class JwtConfigModule { }