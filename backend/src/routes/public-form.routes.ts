import { Router } from "express";
import { getPublicFormController } from "../controllers/public-form.controller.js";
import { submitResponseController } from "../controllers/response.controller.js";
import validateRequest from "../middleware/validate.middleware.js";
import { submitResponseSchema } from "../validators/response.validator.js";
import { responseRateLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.get("/:shareId", getPublicFormController);

router.post(
  "/:shareId/responses",
  responseRateLimiter,
  validateRequest(submitResponseSchema),
  submitResponseController,
);
export default router;
