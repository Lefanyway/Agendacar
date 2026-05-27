import { Request, Response } from "express";
import chatbotService from "../services/ChatbotService";

class ChatbotController {
  async responder(req: Request, res: Response) {
    try {
      const { mensagem, sender } = req.body;

      if (!mensagem || typeof mensagem !== "string") {
        return res.status(400).json({
          resposta: "Não entendi com segurança. Pode digitar de outra forma?",
          intent: "fallback",
          confidence: 0,
          showCards: false,
          cards: [],
          error: false
        });
      }

      const resposta = await chatbotService.responder(
        mensagem,
        typeof sender === "string" ? sender : "usuario-agendacar"
      );

      return res.json(resposta);
    } catch {
      return res.status(500).json({
        resposta: "Tive um problema ao processar sua mensagem. Tente digitar novamente.",
        intent: "erro",
        confidence: 0,
        showCards: false,
        cards: [],
        error: true
      });
    }
  }
}

export default new ChatbotController();
