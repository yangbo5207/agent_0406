import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger as PinoLogger } from 'nestjs-pino'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useLogger(app.get(PinoLogger))
  app.enableCors({ origin: 'http://localhost:3000', methods: ['GET', 'POST'] })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('agent_0406 server')
    .setDescription('Production-oriented NestJS server foundation')
    .setVersion('1.0.0')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT || 3002

  await app.listen(port)
  Logger.log(`Server is running on http://localhost:${port}`, 'Bootstrap')
  Logger.log(`Swagger docs available at http://localhost:${port}/docs`, 'Bootstrap')
}

bootstrap()
