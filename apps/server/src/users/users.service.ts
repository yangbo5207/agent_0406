import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { hashPassword } from './password.util'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(user: {
    id: string
    account: string
    phone: string | null
    name: string
    role: string
    status: string
    creditBalance: Prisma.Decimal
    expiresAt: Date | null
    lastLoginAt: Date | null
    createdAt: Date
    updatedAt: Date
    quotas: {
      gptTokens: number
      geminiTokens: number
      jmTokens: number
    } | null
  }) {
    return {
      id: user.id,
      account: user.account,
      phone: user.phone ?? null,
      name: user.name,
      role: user.role,
      status: user.status,
      creditBalance: user.creditBalance.toString(),
      expiresAt: user.expiresAt?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      quotas: {
        gptTokens: user.quotas?.gptTokens ?? 0,
        geminiTokens: user.quotas?.geminiTokens ?? 0,
        jmTokens: user.quotas?.jmTokens ?? 0,
      },
    }
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { account: createUserDto.account ?? createUserDto.phone },
      select: { id: true },
    })

    if (existingUser) {
      throw new ConflictException('Account already exists')
    }

    const passwordHash = await hashPassword(createUserDto.password)

    const user = await this.prisma.user.create({
      data: {
        account: createUserDto.account ?? createUserDto.phone,
        phone: createUserDto.phone,
        passwordHash,
        name: createUserDto.name,
        role: createUserDto.role ?? 'USER',
        creditBalance: new Prisma.Decimal(createUserDto.creditBalance ?? 0),
        expiresAt: createUserDto.expiresAt ? new Date(createUserDto.expiresAt) : null,
        passwordUpdatedAt: new Date(),
        quotas: {
          create: {
            gptTokens: createUserDto.gptTokens ?? 0,
            geminiTokens: createUserDto.geminiTokens ?? 0,
            jmTokens: createUserDto.jmTokens ?? 0,
          },
        },
      },
      include: {
        quotas: true,
      },
    })

    return this.toResponse(user)
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        quotas: true,
      },
    })

    return users.map((user) => this.toResponse(user))
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        quotas: true,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return this.toResponse(user)
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findFirst({
      where: {
        phone,
        deletedAt: null,
      },
      include: {
        quotas: true,
      },
    })
  }

  async findAuthUserByPhone(phone: string) {
    return this.prisma.user.findFirst({
      where: {
        phone,
        deletedAt: null,
        status: 'ACTIVE',
      },
      include: {
        quotas: true,
      },
    })
  }

  async findAuthUserByAccount(account: string) {
    return this.prisma.user.findFirst({
      where: {
        account,
        deletedAt: null,
        status: 'ACTIVE',
      },
      include: {
        quotas: true,
      },
    })
  }

  async updateLastLogin(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    })
  }
}
