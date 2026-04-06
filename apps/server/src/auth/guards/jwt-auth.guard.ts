import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { PrismaService } from '../../prisma/prisma.service'
import { JwtPayload } from '../types/jwt-payload.type'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const authorization = request.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token')
    }

    const accessToken = authorization.slice(7)

    let payload: JwtPayload

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(accessToken, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      })
    } catch {
      throw new UnauthorizedException('Invalid access token')
    }

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type')
    }

    const session = await this.prisma.authSession.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    })

    if (!session || session.user.deletedAt) {
      throw new UnauthorizedException('Session has been revoked')
    }

    request.user = {
      id: session.user.id,
      account: session.user.account,
      role: session.user.role,
      sid: session.id,
    }

    return true
  }
}
