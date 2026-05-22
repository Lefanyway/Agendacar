import carroService from "./CarroService";

interface RasaMessage {
  recipient_id?: string;
  text?: string;
}

interface ChatbotCard {
  id: number;
  nome: string;
  tipo: string;
  imagem: string | null;
  capacidade: number;
  transmissao: string;
  tanque: number;
  precoDia: number;
  disponivel: boolean;
  acaoTexto: string;
  url: string;
}

interface ChatbotResponse {
  resposta: string;
  origem: "rasa" | "fallback" | "sistema";
  cards?: ChatbotCard[];
}

class ChatbotService {
  async responder(mensagem: string, sender = "usuario-agendacar"): Promise<ChatbotResponse> {
    const texto = mensagem.trim();

    if (!texto) {
      return {
        resposta: "Digite uma mensagem para eu conseguir ajudar.",
        origem: "fallback"
      };
    }

    if (this.ehMensagemInvalida(texto)) {
      return {
        resposta: "Não entendi. Pergunte sobre carros, reservas, pagamento, login ou recomendações.",
        origem: "fallback"
      };
    }

    const respostaComCarro = await this.responderComCardDeCarro(texto);

    if (respostaComCarro) {
      return respostaComCarro;
    }

    try {
      return await this.enviarParaRasa(texto, sender);
    } catch {
      return {
        resposta: "Não consegui conectar ao chatbot agora. Posso ajudar com carros, reservas, pagamento, login ou recomendações.",
        origem: "fallback"
      };
    }
  }

  private async responderComCardDeCarro(mensagem: string): Promise<ChatbotResponse | null> {
    const termoBusca = this.extrairTermoDeCarro(mensagem);

    if (!termoBusca) {
      return null;
    }

    const carros = await carroService.listar({
      busca: termoBusca,
      disponivel: "true"
    });

    const carro = carros[0] as any;

    if (!carro) {
      return {
        resposta: `Não encontrei esse carro disponível agora. Veja a lista de veículos para consultar outras opções.`,
        origem: "sistema"
      };
    }

    const dados = typeof carro.get === "function" ? carro.get({ plain: true }) : carro;

    return {
      resposta: `${dados.nome} está disponível. Confira os dados e clique para reservar.`,
      origem: "sistema",
      cards: [
        {
          id: dados.id,
          nome: dados.nome,
          tipo: dados.tipo,
          imagem: dados.imagem,
          capacidade: dados.capacidade,
          transmissao: dados.transmissao,
          tanque: dados.tanque,
          precoDia: dados.precoDia,
          disponivel: dados.disponivel,
          acaoTexto: "Reservar agora",
          url: `/carros/${dados.id}`
        }
      ]
    };
  }

  private async enviarParaRasa(mensagem: string, sender: string): Promise<ChatbotResponse> {
    const baseUrl = process.env.RASA_BASE_URL || "http://localhost:5005";

    const response = await fetch(`${baseUrl}/webhooks/rest/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender,
        message: mensagem
      })
    });

    if (!response.ok) {
      throw new Error("Erro ao consultar o Rasa.");
    }

    const data = (await response.json()) as RasaMessage[];

    const textos = data
      .map((item) => item.text)
      .filter((item): item is string => Boolean(item));

    if (!textos.length) {
      return {
        resposta: "Não entendi. Pergunte sobre carros, reservas, pagamento, login ou recomendações.",
        origem: "rasa"
      };
    }

    return {
      resposta: textos.join("\n"),
      origem: "rasa"
    };
  }

  private extrairTermoDeCarro(mensagem: string): string | null {
    const texto = this.normalizar(mensagem);

    const aliases = [
      { termos: ["porsche", "porsche 911", "911"], busca: "Porsche" },
      { termos: ["t-cross", "tcross", "t cross"], busca: "T-Cross" },
      { termos: ["civic", "civic type-r", "type-r", "type r"], busca: "Civic" },
      { termos: ["silverado"], busca: "Silverado" }
    ];

    for (const item of aliases) {
      if (item.termos.some((termo) => texto.includes(this.normalizar(termo)))) {
        return item.busca;
      }
    }

    return null;
  }

  private ehMensagemInvalida(mensagem: string): boolean {
    const texto = this.normalizar(mensagem);
    const compacto = texto.replace(/\s+/g, "");

    const palavrasSemContexto = [
      "cagar",
      "merda",
      "bosta",
      "porra",
      "caralho",
      "fodase",
      "kkkk",
      "hahaha",
      "blablabla",
      "asdkjasd",
      "ajskdhasjkdh"
    ];

    if (palavrasSemContexto.some((palavra) => texto === palavra || texto.includes(` ${palavra} `))) {
      return true;
    }

    if (/^[0-9\s!?.,/\\-]+$/.test(texto)) {
      return true;
    }

    if (/^(.)\1{4,}$/.test(compacto)) {
      return true;
    }

    if (compacto.length >= 8) {
      const letras = compacto.match(/[a-z]/g) || [];
      const vogais = compacto.match(/[aeiou]/g) || [];
      const proporcaoVogais = letras.length ? vogais.length / letras.length : 0;

      if (letras.length >= 8 && proporcaoVogais < 0.18) {
        return true;
      }
    }

    return false;
  }

  private normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }
}

export default new ChatbotService();