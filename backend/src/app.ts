
import express from "express";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FormPulse AI API is running",
  });
});

// Handle requests that don't match any route
app.use(notFoundHandler);

// Handle errors passed to Express
app.use(errorHandler);

export default app;
