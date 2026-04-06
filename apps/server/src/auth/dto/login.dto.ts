import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ description: '登录账号，普通用户默认使用手机号，管理员可使用独立账号', example: 'admin' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  account!: string

  @ApiProperty({ description: '登录密码', minLength: 5 })
  @IsString()
  @MinLength(5)
  @MaxLength(128)
  password!: string
}
