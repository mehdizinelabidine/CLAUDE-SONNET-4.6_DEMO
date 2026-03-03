const express = require("express");
const { NestFactory } = require("@nestjs/core");
const { ExpressAdapter } = require("@nestjs/platform-express");
const { ValidationPipe } = require("@nestjs/common");

const server = express();
let cachedApp;

module.exports = async (req, res) => {
  if (!cachedApp) {
    // Import from the pre-built dist (nest build output)
    const { AppModule } = require("../dist/app.module");

    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    app.enableCors({
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix("api");
    await app.init();
    cachedApp = app;
  }

  server(req, res);
};
