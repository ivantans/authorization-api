import { Injectable, UnauthorizedException } from '@nestjs/common';
import { loginDto } from '../common/dto/login.dto';
import { CustomerData } from './interface/customer-data.interface';
import * as bcryptjs from "bcryptjs";
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserAgentRequest } from 'src/common/interface/user-agent-request.interface';
import { UserSessionData } from '../common/interface/session-data.interface';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from '../common/dto/refresh-token.dto';
import { AccessTokenData } from '../common/interface/access-token-data.interface';

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
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
}
