import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserAgentRequest } from 'src/common/interface/user-agent-request.interface';
import { PrismaService } from 'src/database/prisma/prisma.service';
import * as bcryptjs from "bcryptjs"
import { EmployeeData } from './interface/employee-data.interface';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { loginDto } from '../common/dto/login.dto';
import { UserSessionData } from '../common/interface/session-data.interface';
import { RefreshTokenDto } from '../common/dto/refresh-token.dto';
import { AccessTokenData } from '../common/interface/access-token-data.interface';

@Injectable()
export class EmployeeAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) { }

  async validate(loginDto: loginDto): Promise<EmployeeData> {
    try {
      const employeeData = await this.prisma.employee.findUnique({
        where: { email: loginDto.email },
        include: {
          employeeRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      if (!employeeData) {
        throw new UnauthorizedException("Invalid Crendetials.")
      }

      const isPasswordValid = await bcryptjs.compare(loginDto.password, employeeData.password)

      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid Crendetials.")
      }

      const employeeResponse = {
        id: employeeData.id,
        email: employeeData.email,
        createdAt: employeeData.createdAt,
        updatedAt: employeeData.updatedAt,
        roles: employeeData.employeeRoles.map(roleItem => ({
          id: roleItem.role.id,
          name: roleItem.role.name
        })),
      }

      return employeeResponse
    } catch (e) {
      throw e
    }
  }

  async upsertSession(accessToken: string, userAgentId: number, refreshToken: string, validatedEmployee: EmployeeData): Promise<UserSessionData> {
    try {
      const session = await this.prisma.employeeSession.upsert({
        where: {
          employeeId: validatedEmployee.id
        },
        update: {
          accessToken: accessToken,
          userAgentId: userAgentId,
          refreshToken: refreshToken,
        },
        create: {
          employeeId: validatedEmployee.id,
          accessToken: accessToken,
          userAgentId: userAgentId,
          refreshToken: refreshToken,
        }
      })
      return session;
    } catch (e) {
      throw e;
    }
  }

  async generateSession(req: UserAgentRequest, validatedEmployee: EmployeeData): Promise<UserSessionData> {
    try {

      const userAgentId: number = req.userAgentId;

      const accessTokenPayload = {
        sub: validatedEmployee.id,
        email: validatedEmployee.email,
        accountType: "EMPLOYEE",
        roles: validatedEmployee.roles.map(roleItem => roleItem.name),
        tokenType: "ACCESS_TOKEN"
      }
      const refreshTokenPayload = {
        sub: validatedEmployee.id,
        email: validatedEmployee.email,
        accountType: "EMPLOYEE",
        tokenType: "REFRESH_TOKEN"
      }

      const accessToken = await this.jwtService.signAsync(accessTokenPayload, { expiresIn: "15m" });
      const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, { expiresIn: "7d" });

      const session = await this.upsertSession(accessToken, userAgentId, refreshToken, validatedEmployee);
      return {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken
      }

    } catch (e) {
      throw e;
    }

  }

  async refreshToken(req: UserAgentRequest, refreshTokenDto: RefreshTokenDto): Promise<AccessTokenData> {
    try {
      const userAgentId = req.userAgentId;
      const isRefreshTokenValid = await this.prisma.employeeSession.findFirst({
        where: {
          userAgentId: userAgentId,
          refreshToken: refreshTokenDto.refreshToken
        },
      })

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException("The provided refresh token is invalid or does not match the current session.");
      }

      const employeeData = await this.prisma.employee.findUnique({
        where: { id: isRefreshTokenValid.employeeId },
        include: {
          employeeRoles: {
            select: {
              role: {
                select: { name: true }
              }
            }
          }
        }
      });

      const accessTokenPayload = {
        sub: employeeData.id,
        email: employeeData.email,
        accountType: "EMPLOYEE",
        roles: employeeData.employeeRoles.map(roleItem => roleItem.role.name),
        tokenType: "ACCESS_TOKEN"
      }

      const accessToken = await this.jwtService.signAsync(accessTokenPayload, { expiresIn: "15m" });


      const updateSession = await this.prisma.employeeSession.update({
        where: {
          employeeId: employeeData.id,
        },
        data: {
          accessToken: accessToken
        }
      })
      return { accessToken };
    } catch (e) {
      throw e;
    }
  }

  async register(registerDto: RegisterDto): Promise<EmployeeData> {
    try {
      const isEmailExist = await this.prisma.employee.findUnique({
        where: {
          email: registerDto.email
        }
      });

      if (isEmailExist) {
        throw new ConflictException("Another account is using the same email.")
      }
      const newEmployee = await this.prisma.employee.create({
        data: {
          email: registerDto.email,
          password: await bcryptjs.hash(registerDto.password, 12),
          employeeRoles: {
            create: {
              role: {
                connect: { name: "BASIC" }
              }
            }
          }
        },
        include: {
          employeeRoles: {
            include: {
              role: true
            }
          }
        }
      });
      return {
        id: newEmployee.id,
        email: newEmployee.email,
        roles: newEmployee.employeeRoles.map(roleItem => ({
          id: roleItem.role.id,
          name: roleItem.role.name
        })),
        updatedAt: newEmployee.updatedAt,
        createdAt: newEmployee.createdAt,

      }
    } catch (e) {
      throw e
    }
  }
}
