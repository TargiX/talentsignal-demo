import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/create-app";

const server = express();
let ready: Promise<void> | null = null;

async function bootstrap() {
  if (!ready) {
    ready = NestFactory.create(AppModule, new ExpressAdapter(server)).then(async (app) => {
      configureApp(app);
      await app.init();
    });
  }

  return ready;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  await bootstrap();
  return server(request, response);
}
