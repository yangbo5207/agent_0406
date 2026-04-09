import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { StorageService } from './storage.service'
import { UploadResponseDto } from './dto/upload-response.dto'

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @ApiOperation({ summary: '上传文件（图片或视频）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOkResponse({ type: UploadResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'video/mp4']
        if (!allowed.includes(file.mimetype)) {
          cb(
            new BadRequestException('仅支持 PNG、JPEG、MP4 格式文件'),
            false,
          )
        } else {
          cb(null, true)
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择要上传的文件')
    return this.storageService.upload(file)
  }
}
