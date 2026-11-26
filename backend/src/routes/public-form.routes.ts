
import { Router } from "express";
import { getPublicFormController } from "../controllers/public-form.controller.js";

const router = Router();

router.get("/:shareId", getPublicFormController);

export default router;
