import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class UserTokenQuotaDto {
  @ApiProperty()
  gptTokens!: number

  @ApiProperty()
  geminiTokens!: number

  @ApiProperty()
  jmTokens!: number
}

export class UserResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  account!: string

  @ApiPropertyOptional()
  phone!: string | null

  @ApiProperty()
  name!: string

  @ApiProperty()
  role!: string

  @ApiProperty()
  status!: string

  @ApiProperty()
  creditBalance!: string

  @ApiPropertyOptional()
  expiresAt?: string | null

  @ApiPropertyOptional()
  lastLoginAt?: string | null

  @ApiProperty()
  createdAt!: string

  @ApiProperty()
  updatedAt!: string

  @ApiProperty({ type: UserTokenQuotaDto })
  quotas!: UserTokenQuotaDto
}
