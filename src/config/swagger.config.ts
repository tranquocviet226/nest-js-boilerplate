import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'
import { AUTH_OPTIONS, TOKEN_NAME } from 'src/modules/auth'
import { ConfigService } from '@nestjs/config'

/**
 * Setup swagger in the application
 * @param app {INestApplication}
 */
export const configSwagger = (
  app: INestApplication,
  configService: ConfigService
) => {
  const options = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE'))
    .setDescription(configService.get('SWAGGER_DESCRIPTION'))
    .setVersion(configService.get('SWAGGER_VERSION'))
    .addBearerAuth(AUTH_OPTIONS, TOKEN_NAME)
    .addServer(configService.get('BASE_URL'))
    .build()

  const document = SwaggerModule.createDocument(app, options)

  SwaggerModule.setup('swagger', app, document)
}
