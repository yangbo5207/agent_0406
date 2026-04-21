import { ApiProperty } from '@nestjs/swagger'

export class UploadResponseDto {
  @ApiProperty({ example: 'http://localhost:9000/uploads/1712678400000-abc123.png' })
  url!: string

  @ApiProperty({ example: '1712678400000-abc123.png' })
  key!: string
}
