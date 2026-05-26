import { Request, Response } from "express";
import carroService from "../services/CarroService";

class CarroController {
  async listar(req: Request, res: Response) {
    try {
      const carros = await carroService.listar(req.query);
      return res.json(carros);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const carro = await carroService.buscarPorId(Number(req.params.id));
      return res.json(carro);
    } catch (error: any) {
      return res.status(error.message === "ID inválido." ? 400 : 404).json({ erro: error.message });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const carro = await carroService.criar(req.body);
      return res.status(201).json(carro);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const carro = await carroService.atualizar(Number(req.params.id), req.body);
      return res.json(carro);
    } catch (error: any) {
      const status = error.message === "Carro não encontrado." ? 404 : 400;
      return res.status(status).json({ erro: error.message });
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      const resposta = await carroService.deletar(Number(req.params.id));
      return res.json(resposta);
    } catch (error: any) {
      return res.status(error.message === "ID inválido." ? 400 : 404).json({ erro: error.message });
    }
  }
}

export default new CarroController();
