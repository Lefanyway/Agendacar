import { Router } from "express";
import carroController from "../controllers/CarroController";

const router = Router();

router.get("/", carroController.listar);
router.get("/:id", carroController.buscarPorId);
router.post("/", carroController.criar);
router.put("/:id", carroController.atualizar);
router.delete("/:id", carroController.deletar);

export default router;