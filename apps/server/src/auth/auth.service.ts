import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UserRole, UserStatus } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'
import { verifyPassword, hashPassword } from '../users/password.util'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'
import { JwtPayload } from './types/jwt-payload.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  private async revokeAllUserSessions(userId: string) {
    await this.prisma.authSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    })
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findAuthUserByAccount(loginDto.account)

    if (!user) {
      throw new UnauthorizedException('Invalid account or password')
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is disabled')
    }

    const passwordMatches = await verifyPassword(loginDto.password, user.passwordHash)

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid account or password')
    }

    await this.revokeAllUserSessions(user.id)

    return this.createSessionAndTokens(user.id, user.account, user.role)
  }

  async refresh(refreshToken: string) {
    const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')

    let payload: JwtPayload

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      })
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type')
    }

    const session = await this.prisma.authSession.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
      },
      include: {
        user: {
          include: {
            quotas: true,
          },
        },
      },
    })

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh session expired')
    }

    const refreshTokenMatches = await verifyPassword(refreshToken, session.refreshTokenHash)

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token mismatch')
    }

    await this.revokeAllUserSessions(session.user.id)

    return this.createSessionAndTokens(session.user.id, session.user.account, session.user.role)
  }

  async logout(refreshToken: string) {
    const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')

    let payload: JwtPayload

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      })
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }

    await this.prisma.authSession.updateMany({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    })

    return { success: true }
  }

  async me(userId: string) {
    return this.usersService.findOne(userId)
  }

  private async createSessionAndTokens(userId: string, account: string, role: UserRole) {
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d')
    const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')

    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const session = await this.prisma.authSession.create({
      data: {
        userId,
        refreshTokenHash: 'pending',
        expiresAt: refreshExpiresAt,
      },
    })

    const accessPayload: JwtPayload = {
      sub: userId,
      account,
      role,
      sid: session.id,
      type: 'access',
    }

    const refreshPayload: JwtPayload = {
      sub: userId,
      account,
      role,
      sid: session.id,
      type: 'refresh',
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as never,
      }),
    ])

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await hashPassword(refreshToken),
        lastUsedAt: new Date(),
      },
    })

    await this.usersService.updateLastLogin(userId)

    const normalizedUser = await this.usersService.findOne(userId)

    return {
      accessToken,
      refreshToken,
      user: normalizedUser,
    }
  }
}
