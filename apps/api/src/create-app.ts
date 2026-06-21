import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { INestApplication } from "@nestjs/common";

export function configureApp(app: INestApplication) {
  const config = app.get(ConfigService);
  const origin = config.get<string>("APP_ORIGIN") ?? "http://localhost:3000";

  app.enableCors({
    origin: [
      origin,
      /^https:\/\/.*\.vercel\.app$/,
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/
    ],
    credentials: true
  });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("TalentSignal API")
      .setDescription("NestJS API for an HR social discovery demo.")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build()
  );
  SwaggerModule.setup("docs", app, document);
}
