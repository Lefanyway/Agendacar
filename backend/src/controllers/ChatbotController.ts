import { Request, Response } from "express";
import chatbotService from "../services/ChatbotService";

class ChatbotController {
  async responder(req: Request, res: Response) {
    try {
      const { mensagem, sender } = req.body;

      if (!mensagem || typeof mensagem !== "string") {
        return res.status(400).json({
          erro: "O campo mensagem é obrigatório."
        });
      }

      const resposta = await chatbotService.responder(
        mensagem,
        typeof sender === "string" ? sender : "usuario-agendacar"
      );

      return res.json(resposta);
    } catch (error: any) {
      return res.status(500).json({
        erro: error.message || "Erro ao processar mensagem do chatbot."
      });
    }
  }
}

export default new ChatbotController();