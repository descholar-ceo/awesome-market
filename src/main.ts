import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DEVELOPMENT } from './common/constants.common';
import * as morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

config();

async function bootstrap() {
  const {
    env: { PORT, NODE_ENV },
  } = process;
  const app = await NestFactory.create(AppModule);
  app.use(morgan('short'));
  const config = new DocumentBuilder()
    .setTitle('Awesome Market')
    .setDescription(
      'An online marketplace that allows users to buy and sell products, manage their inventory and process orders.',
    )
    .setVersion('1.0')
    .addTag('awesome-market')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      enableDebugMessages: true,
    }),
  );
  await app.listen(PORT);
  if (NODE_ENV === DEVELOPMENT) {
    Logger.debug(`Awesome API is listening ${await app.getUrl()}...`);
  }
}
bootstrap();
