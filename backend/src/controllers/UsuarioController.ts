import { Request, Response } from "express";
import usuarioService from "../services/UsuarioService";

class UsuarioController {
  async cadastrar(req: Request, res: Response) {
    try {
      const usuario = await usuarioService.cadastrar(req.body);
      return res.status(201).json(usuario);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const resposta = await usuarioService.login(req.body);
      return res.json(resposta);
    } catch (error: any) {
      return res.status(401).json({ erro: error.message });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
      }

      const usuario = await usuarioService.perfil(usuarioId);
      return res.json(usuario);
    } catch (error: any) {
      return res.status(401).json({ erro: error.message });
    }
  }
}

export default new UsuarioController();