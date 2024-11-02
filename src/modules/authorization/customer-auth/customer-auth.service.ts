import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { loginDto } from '../common/dto/login.dto';
import { CustomerData } from './interface/customer-data.interface';
import * as bcryptjs from "bcryptjs";
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserAgentRequest } from 'src/common/interface/user-agent-request.interface';
import { UserSessionData } from '../common/interface/session-data.interface';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from '../common/dto/refresh-token.dto';
import { AccessTokenData } from '../common/interface/access-token-data.interface';
import { RegisterDto } from './dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { UnverifiedCustomerData } from './interface/unverified-customer-data.interface';

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) { }

  async validate(loginDto: loginDto): Promise<CustomerData> {
    try {
      const customerData = await this.prisma.customer.findUnique({
        where: {
          email: loginDto.email
        },
        include: {
          customerRoles: {
            include: {
              role: {
                select: {
                  name: true,
                  id: true
                }
              }
            }
          }
        }
      });

      if (!customerData) {
        throw new UnauthorizedException("Invalid Credentials")
      }

      if (customerData.emailStatus === "UNVERIFIED") {
        throw new UnauthorizedException("Invalid Credentials")
      }

      const isPasswordValid = await bcryptjs.compare(loginDto.password, customerData.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid Credentials")
      }

      return {
        id: customerData.id,
        email: customerData.email,
        emailStatus: customerData.emailStatus,
        roles: customerData.customerRoles.map(roleItem => ({
          id: roleItem.role.id,
          name: roleItem.role.name,
        })),
        updatedAt: customerData.updatedAt,
        createdAt: customerData.createdAt
      }
    } catch (e) {
      throw e;
    }
  }

  async generateSession(req: UserAgentRequest, validatedCustomer: CustomerData): Promise<UserSessionData> {
    try {
      const userAgentId = req.userAgentId;

      const accessTokenPayload = {
        sub: validatedCustomer.id,
        email: validatedCustomer.email,
        accountType: "CUSTOMER",
        roles: validatedCustomer.roles.map(roleItem => roleItem.name),
        tokenType: "ACCESS_TOKEN"
      }

      const refreshTokenPayload = {
        sub: validatedCustomer.id,
        email: validatedCustomer.email,
        accountType: "CUSTOMER",
        tokenType: "REFRESH_TOKEN"
      }

      const accessToken = await this.jwtService.signAsync(accessTokenPayload, { expiresIn: "15m" });
      const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, { expiresIn: "7d" });


      const session = await this.prisma.customerSession.upsert({
        where: {
          customerId: validatedCustomer.id
        },
        update: {
          accessToken: accessToken,
          lastLogin: new Date(),
          refreshToken: refreshToken,
          userAgentId: userAgentId
        },
        create: {
          customerId: validatedCustomer.id,
          accessToken: accessToken,
          lastLogin: new Date(),
          refreshToken: refreshToken,
          userAgentId: userAgentId
        }
      });

      return {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken
      }
    } catch (e) {
      throw e
    }
  }

  async refreshToken(req: UserAgentRequest, refreshTokenDto: RefreshTokenDto): Promise<AccessTokenData> {
    try {
      const userAgentId = req.userAgentId;

      const session = await this.prisma.customerSession.findUnique({
        where: {
          userAgentId: userAgentId,
          refreshToken: refreshTokenDto.refreshToken
        }
      });

      if (!session) {
        throw new UnauthorizedException("The provided refresh token is invalid or does not match the current session.");
      }

      const customerData = await this.prisma.customer.findUnique({
        where: {
          id: session.customerId
        },
        include: {
          customerRoles: {
            include: {
              role: {
                select: { name: true, }
              }
            }
          }
        }
      });

      const accessTokenPayload = {
        sub: customerData.id,
        email: customerData.email,
        accountType: "CUSTOMER",
        roles: customerData.customerRoles.map(roleItem => roleItem.role.name),
        tokenType: "ACCESS_TOKEN"
      }

      const accessToken = await this.jwtService.signAsync(accessTokenPayload, { expiresIn: "15m" });

      const updateSession = await this.prisma.customerSession.update({
        where: {
          customerId: customerData.id
        },
        data: {
          accessToken: accessToken
        }
      })

      return {
        accessToken: updateSession.accessToken
      }
    } catch (e) {
      throw e;
    }
  }

  async register(registerDto: RegisterDto): Promise<UnverifiedCustomerData> {
    try {
      const isEmailExist = await this.prisma.customer.findUnique({
        where: {
          email: registerDto.email
        }
      });

      if (isEmailExist && isEmailExist.emailStatus === "VERIFIED") {
        throw new ConflictException("Another account is using the same email.")
      }

      const newCustomer = isEmailExist
        ? await this.prisma.customer.update({
          where: {
            email: registerDto.email
          },
          data: {
            password: await bcryptjs.hash(registerDto.password, 12)
          }
        })
        : await this.prisma.customer.create({
          data: {
            email: registerDto.email,
            password: await bcryptjs.hash(registerDto.password, 12)
          }
        })

      const tokenPayload = {
        sub: newCustomer.id,
        email: newCustomer.email,
        accountType: "CUSTOMER",
        tokenType: "VERIFY_USER",
      }

      const registerToken = await this.jwtService.signAsync(tokenPayload, { expiresIn: "15m" });
      const appUrl = this.configService.get<string>('APP_URL');
      const verifyingMessage = `${appUrl}/api/v1/customer-auth/verify-email?token=${registerToken}`

      try {
        await this.mailerService.sendMail({
          from: 'AUTHORIZATION API <test123@gmail.com>',
          to: registerDto.email,
          subject: "Please Verify Your Account",
          html: `<p>Click <a href="${verifyingMessage}">here</a> to verify your account.</p>`,
        });
      } catch (mailError) {
        console.error("Failed to send verification email:", mailError);
        throw new InternalServerErrorException("Unable to send verification email. Please try again later.");
      }
      return {
        id: newCustomer.id,
        email: newCustomer.email,
        emailStatus: newCustomer.emailStatus,
        updatedAt: newCustomer.updatedAt,
        createdAt: newCustomer.createdAt,
      }

    } catch (e) {
      throw e;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      if (!token) {
        throw new UnauthorizedException("Invalid Crendentials");
      }

      const isTokenValid = await this.jwtService.verifyAsync(token);
      const updateEmailStatus = await this.prisma.customer.update({
        where: {
          id: isTokenValid.sub
        },
        data: {
          emailStatus: "VERIFIED",
          customerRoles: {
            create: [
              { role: { connect: { name: "BASIC" } } }
            ]
          }
        }
      });
    } catch (e) {
      throw e;
    }
  }
}
