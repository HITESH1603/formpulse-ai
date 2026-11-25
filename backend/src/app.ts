import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FormPulse AI API is running",
  });
});

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
