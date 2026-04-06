import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Prisma, UserRole } from '@prisma/client'

import { hashPassword } from '../src/users/password.util'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required for seeding')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await hashPassword('Password123!')
  const adminPasswordHash = await hashPassword('admin')

  await prisma.user.upsert({
    where: {
      account: 'admin',
    },
    create: {
      account: 'admin',
      phone: null,
      passwordHash: adminPasswordHash,
      name: '系统管理员',
      role: UserRole.ADMIN,
      creditBalance: new Prisma.Decimal(0),
      passwordUpdatedAt: new Date(),
      quotas: {
        create: {
          gptTokens: 0,
          geminiTokens: 0,
          jmTokens: 0,
        },
      },
    },
    update: {
      passwordHash: adminPasswordHash,
      name: '系统管理员',
      role: UserRole.ADMIN,
      passwordUpdatedAt: new Date(),
    },
  })

  await prisma.user.upsert({
    where: {
      account: '+8613800138000',
    },
    create: {
      account: '+8613800138000',
      phone: '+8613800138000',
      passwordHash,
      name: '默认测试用户',
      role: UserRole.USER,
      creditBalance: new Prisma.Decimal(1000),
      expiresAt: new Date('2026-12-31T23:59:59.000Z'),
      passwordUpdatedAt: new Date(),
      quotas: {
        create: {
          gptTokens: 500000,
          geminiTokens: 500000,
          jmTokens: 200000,
        },
      },
    },
    update: {
      passwordHash,
      name: '默认测试用户',
      role: UserRole.USER,
      creditBalance: new Prisma.Decimal(1000),
      expiresAt: new Date('2026-12-31T23:59:59.000Z'),
      passwordUpdatedAt: new Date(),
      quotas: {
        upsert: {
          create: {
            gptTokens: 500000,
            geminiTokens: 500000,
            jmTokens: 200000,
          },
          update: {
            gptTokens: 500000,
            geminiTokens: 500000,
            jmTokens: 200000,
          },
        },
      },
    },
  })

  console.log('Seed completed:')
  console.log('admin account: admin')
  console.log('admin password: admin')
  console.log('role: ADMIN')
  console.log('default user phone/account: +8613800138000')
  console.log('default user password: Password123!')
  console.log('default user role: USER')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
