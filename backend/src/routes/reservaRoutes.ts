import { Router } from "express";
import reservaController from "../controllers/ReservaController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, reservaController.listar);
router.post("/", authMiddleware, reservaController.criar);
router.patch("/:id/cancelar", authMiddleware, reservaController.cancelar);

export default router;