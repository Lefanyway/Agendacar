import { Router } from "express";
import recomendacaoController from "../controllers/RecomendacaoController";

const router = Router();

router.post("/carros", recomendacaoController.recomendar);

export default router;