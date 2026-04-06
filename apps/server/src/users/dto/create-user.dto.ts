import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class CreateUserDto {
  @ApiPropertyOptional({ description: '登录账号；不传时默认使用手机号', example: 'admin' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  account?: string

  @ApiProperty({ description: '手机号，作为登录账号', example: '+8613800138000' })
  @IsPhoneNumber('CN')
  phone!: string

  @ApiProperty({ description: '登录密码，明文仅用于创建时传入', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string

  @ApiProperty({ description: '用户名称', example: '张三' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string

  @ApiPropertyOptional({ enum: UserRole, description: '用户角色，默认普通用户' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @ApiPropertyOptional({ description: '充值额度余额', example: 100 })
  @IsOptional()
  @Min(0)
  creditBalance?: number

  @ApiPropertyOptional({ description: '套餐或额度过期时间', example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  expiresAt?: string

  @ApiPropertyOptional({ description: 'GPT token 额度', example: 500000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  gptTokens?: number

  @ApiPropertyOptional({ description: 'Gemini token 额度', example: 500000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  geminiTokens?: number

  @ApiPropertyOptional({ description: '即梦 token 额度', example: 200000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  jmTokens?: number
}
