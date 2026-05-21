import { Request, Response } from "express";
import reservaService from "../services/ReservaService";

class ReservaController {
  async listar(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
      }

      const reservas = await reservaService.listarPorUsuario(usuarioId);
      return res.json(reservas);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
      }

      const reserva = await reservaService.criar({
        usuarioId,
        carroId: Number(req.body.carroId || req.body.CarroId),
        dataInicio: req.body.dataInicio,
        dataFim: req.body.dataFim,
        destino: req.body.destino
      });

      return res.status(201).json(reserva);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  async cancelar(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
      }

      const reserva = await reservaService.cancelar(Number(req.params.id), usuarioId);

      return res.json(reserva);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }
}

export default new ReservaController();