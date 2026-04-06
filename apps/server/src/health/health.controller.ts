import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { PrismaService } from '../prisma/prisma.service'
import { HealthResponseDto, RootResponseDto } from './dto/health-response.dto'

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get service overview' })
  @ApiOkResponse({ type: RootResponseDto })
  getRoot() {
    return {
      project: 'agent_0406',
      service: 'server',
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      database: 'postgresql',
      orm: 'prisma',
      timestamp: new Date().toISOString(),
      prisma: this.prisma.isConfigured(),
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Get health status' })
  @ApiOkResponse({ type: HealthResponseDto })
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  }
}
