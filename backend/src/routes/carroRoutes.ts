import { Router } from "express";
import carroController from "../controllers/CarroController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = Router();

router.get("/", carroController.listar);
router.get("/:id", carroController.buscarPorId);

router.post("/", authMiddleware, adminMiddleware, carroController.criar);
router.put("/:id", authMiddleware, adminMiddleware, carroController.atualizar);
router.delete("/:id", authMiddleware, adminMiddleware, carroController.deletar);

export default router;