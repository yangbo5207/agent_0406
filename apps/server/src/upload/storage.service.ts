import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { extname } from 'path'

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name)
  private readonly s3: S3Client
  private readonly bucket: string
  private readonly publicUrl: string

  constructor(private readonly config: ConfigService) {
    const endpoint = config.getOrThrow<string>('MINIO_ENDPOINT')
    const port = config.getOrThrow<number>('MINIO_PORT')
    const useSsl = config.getOrThrow<boolean>('MINIO_USE_SSL')
    const protocol = useSsl ? 'https' : 'http'

    this.bucket = config.getOrThrow<string>('MINIO_BUCKET')
    this.publicUrl = `${protocol}://${endpoint}:${port}`

    this.s3 = new S3Client({
      endpoint: this.publicUrl,
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.getOrThrow<string>('MINIO_ACCESS_KEY'),
        secretAccessKey: config.getOrThrow<string>('MINIO_SECRET_KEY'),
      },
      forcePathStyle: true,
    })
  }

  async onModuleInit() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }))
      this.logger.log(`Bucket "${this.bucket}" exists`)
    } catch {
      this.logger.log(`Creating bucket "${this.bucket}"...`)
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }))

      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      })
      await this.s3.send(
        new PutBucketPolicyCommand({ Bucket: this.bucket, Policy: policy }),
      )
      this.logger.log(`Bucket "${this.bucket}" created with public-read policy`)
    }
  }

  async upload(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    const key = `${Date.now()}-${randomUUID()}${extname(file.originalname)}`

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    )

    return {
      url: `${this.publicUrl}/${this.bucket}/${key}`,
      key,
    }
  }
}
