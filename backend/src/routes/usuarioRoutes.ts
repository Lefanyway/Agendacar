import { Router } from "express";
import usuarioController from "../controllers/UsuarioController";

const router = Router();

router.post("/cadastrar", usuarioController.cadastrar);
router.post("/login", usuarioController.login);

export default router;