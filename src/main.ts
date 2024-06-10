import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DEVELOPMENT } from './common/constants.common';
import * as morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

config();

async function bootstrap() {
  const {
    env: { PORT, NODE_ENV },
  } = process;
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const rawBodyBuffer = (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  };

  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));
  app.use(morgan('short'));
  const config = new DocumentBuilder()
    .setTitle('Awesome Market')
    .setDescription(
      'An online marketplace that allows users to buy and sell products, manage their inventory and process orders.',
    )
    .addBearerAuth(
      {
        description: 'Please enter your access token',
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'Authorization',
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
