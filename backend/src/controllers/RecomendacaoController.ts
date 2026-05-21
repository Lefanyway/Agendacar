import { Request, Response } from "express";
import recomendacaoService from "../services/RecomendacaoService";

class RecomendacaoController {
  async recomendar(req: Request, res: Response) {
    try {
      const resultado = await recomendacaoService.recomendar({
        orcamentoDia: req.body.orcamentoDia ? Number(req.body.orcamentoDia) : undefined,
        passageiros: req.body.passageiros ? Number(req.body.passageiros) : undefined,
        tipoViagem: req.body.tipoViagem,
        transmissao: req.body.transmissao
      });

      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }
}

export default new RecomendacaoController();