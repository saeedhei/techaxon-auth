import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import * as cookieParser from 'cookie-parser';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
  
//   // Enable cookie parsing middleware
//   app.use(cookieParser());
  
//   // Enable CORS for frontend clients
//   app.enableCors({
//     origin: true,
//     credentials: true,
//   });

//   await app.listen(3000);
// }
// bootstrap();