import { UsuarioRole } from "../models/Usuario";

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        email: string;
        role: UsuarioRole;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export {};