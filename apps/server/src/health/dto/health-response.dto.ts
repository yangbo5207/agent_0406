import { ApiProperty } from '@nestjs/swagger'

export class RootResponseDto {
  @ApiProperty()
  project!: string

  @ApiProperty()
  service!: string

  @ApiProperty()
  status!: string

  @ApiProperty()
  environment!: string

  @ApiProperty()
  database!: string

  @ApiProperty()
  orm!: string

  @ApiProperty()
  timestamp!: string

  @ApiProperty()
  prisma!: boolean
}

export class HealthResponseDto {
  @ApiProperty()
  status!: string

  @ApiProperty()
  uptime!: number

  @ApiProperty()
  timestamp!: string
}
