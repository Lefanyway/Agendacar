import { Router } from "express";
import chatbotController from "../controllers/ChatbotController";

const router = Router();

router.post("/", chatbotController.responder);

export default router;