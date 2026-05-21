import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ erro: "Token não informado." });
    return;
  }

  const [tipo, token] = authHeader.split(" ");

  if (tipo !== "Bearer" || !token) {
    res.status(401).json({ erro: "Token inválido." });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ erro: "JWT_SECRET não foi configurado." });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as Express.Request["usuario"];

    req.usuario = decoded;

    next();
  } catch {
    res.status(401).json({ erro: "Token expirado ou inválido." });
  }
};