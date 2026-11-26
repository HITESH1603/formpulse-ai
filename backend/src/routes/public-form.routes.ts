
import { Router } from "express";
import { getPublicFormController } from "../controllers/public-form.controller.js";
import { submitResponseController } from "../controllers/response.controller.js";
import validateRequest from "../middleware/validate.middleware.js";
import { submitResponseSchema } from "../validators/response.validator.js";

const router = Router();

router.get("/:shareId", getPublicFormController);

router.post(
  "/:shareId/responses",
  validateRequest(submitResponseSchema),
  submitResponseController,
);

export default router;
