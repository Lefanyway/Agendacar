import { RequestHandler } from "express";

export const adminMiddleware: RequestHandler = (req, res, next) => {
  if (!req.usuario) {
    res.status(401).json({ erro: "Usuário não autenticado." });
    return;
  }

  if (req.usuario.role !== "admin") {
    res.status(403).json({ erro: "Acesso permitido apenas para administradores." });
    return;
  }

  next();
};