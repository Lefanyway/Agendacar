import { Router } from "express";
import usuarioController from "../controllers/UsuarioController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/cadastrar", usuarioController.cadastrar);
router.post("/login", usuarioController.login);
router.get("/me", authMiddleware, usuarioController.me);

export default router;