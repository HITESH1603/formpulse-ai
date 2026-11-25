import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import formRoutes from "./routes/form.routes.js";
import { csrfMiddleware } from "./middleware/csrf.middleware.js";
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

app.use("/api", (req, res, next) => {
  const mutatingMethods = ["POST", "PATCH", "PUT", "DELETE"];

  if (mutatingMethods.includes(req.method)) {
    csrfMiddleware(req, res, next);
    return;
  }

  next();
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FormPulse AI API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/forms", formRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
