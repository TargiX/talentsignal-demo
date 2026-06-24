import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { INestApplication } from "@nestjs/common";
import type { Request, Response } from "express";

export function configureApp(app: INestApplication) {
  const config = app.get(ConfigService);
  const configuredOrigins = (config.get<string>("APP_ORIGIN") ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: [
      ...configuredOrigins,
      "https://talentsignal.us",
      "https://www.talentsignal.us",
      "https://charforge.art",
      "https://www.charforge.art",
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

  const server = app.getHttpAdapter().getInstance();
  server.get(["/docs-json", "/openapi.json"], (_request: Request, response: Response) => {
    response.json(document);
  });
  server.get("/docs", (_request: Request, response: Response) => {
    response.type("html").send(renderSwaggerHtml());
  });
}

function renderSwaggerHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TalentSignal API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #f8faf9; }
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 32px 0; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.addEventListener("load", function () {
        window.ui = SwaggerUIBundle({
          url: "/docs-json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: "StandaloneLayout"
        });
      });
    </script>
  </body>
</html>`;
}
