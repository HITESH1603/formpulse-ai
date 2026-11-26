import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import {
  createFormSchema,
  updateFormSchema,
} from "../validators/form.validator.js";
import {
  createFormController,
  getUserFormsController,
  getFormByIdController,
  updateFormController,
  deleteFormController,
  publishFormController,
  closeFormController,
} from "../controllers/form.controller.js";
import { getFormResponsesController } from "../controllers/form-response.controller.js";
import { getFormAnalyticsController } from "../controllers/form-analytics.controller.js";
import { exportFormResponsesController } from "../controllers/form-export.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getUserFormsController);
router.post("/", validateRequest(createFormSchema), createFormController);
router.post("/:id/publish", publishFormController);
router.post("/:id/close", closeFormController);
router.get("/:id/responses", getFormResponsesController);
router.get("/:id/analytics", getFormAnalyticsController);
router.get("/:id/export", exportFormResponsesController);
router.get("/:id", getFormByIdController);
router.patch("/:id", validateRequest(updateFormSchema), updateFormController);
router.delete("/:id", deleteFormController);

export default router;
