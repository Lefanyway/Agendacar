import carroService from "./CarroService";

type ChatbotOrigem = "sistema" | "rasa" | "fallback";

type ChatbotIntent =
  | "saudacao"
  | "agradecimento"
  | "despedida"
  | "ajuda_geral"
  | "consultar_carros"
  | "reservar_carro"
  | "recomendacao_carro"
  | "filtros_carros"
  | "consultar_modelo"
  | "cancelar_reserva"
  | "alterar_reserva"
  | "minhas_reservas"
  | "pagamento"
  | "login_cadastro"
  | "problema_login"
  | "area_admin"
  | "suporte_humano"
  | "fora_escopo"
  | "fallback"
  | "erro";

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
  origem: ChatbotOrigem;
  intent: ChatbotIntent;
  confidence: number;
  showCards: boolean;
  cards: ChatbotCard[];
  error: boolean;
}

interface CarroNormalizado {
  id: number;
  nome: string;
  tipo: string;
  imagem: string | null;
  capacidade: number;
  transmissao: string;
  tanque: number;
  precoDia: number;
  disponivel: boolean;
}

interface Classificacao {
  intent: ChatbotIntent;
  confidence: number;
  ambigua?: [ChatbotIntent, ChatbotIntent];
}

interface IntentConfig {
  intent: ChatbotIntent;
  prioridade: number;
  termos: Record<string, number>;
}

const INTENTS_COM_CARDS = new Set<ChatbotIntent>([
  "consultar_carros",
  "reservar_carro",
  "consultar_modelo",
  "filtros_carros",
  "recomendacao_carro"
]);

const RESPOSTAS: Record<ChatbotIntent, string> = {
  saudacao:
    "Olá! Posso ajudar com carros, reservas, pagamento, login e suporte do AgendaCar.",
  agradecimento:
    "De nada! Quando precisar, posso ajudar com carros e reservas.",
  despedida:
    "Até mais! Quando precisar, estou por aqui.",
  ajuda_geral:
    "Posso ajudar com carros, reservas, pagamento, login e suporte do AgendaCar.",
  consultar_carros:
    "Encontrei os carros disponíveis. Confira os cards abaixo.",
  reservar_carro:
    "Escolha um carro disponível nos cards abaixo e informe o período da reserva.",
  recomendacao_carro:
    "Encontrei algumas opções para você. Confira os cards abaixo.",
  filtros_carros:
    "Encontrei alguns carros com esse perfil. Confira os cards abaixo.",
  consultar_modelo:
    "Encontrei este modelo na frota. Confira o card abaixo.",
  cancelar_reserva:
    "Para cancelar, acesse Minhas Reservas, selecione a reserva e clique em cancelar.",
  alterar_reserva:
    "Para alterar, acesse Minhas Reservas e selecione a reserva desejada.",
  minhas_reservas:
    "Você pode consultar suas reservas em Minhas Reservas após fazer login.",
  pagamento:
    "O pagamento é feito na finalização da reserva. Confira as opções disponíveis na tela de pagamento.",
  login_cadastro:
    "Para acessar sua conta, use a tela de login ou cadastro.",
  problema_login:
    "Verifique seu e-mail e senha. Se o erro continuar, tente redefinir o acesso.",
  area_admin:
    "A área administrativa é restrita a usuários autorizados.",
  suporte_humano:
    "Para suporte, procure o canal de atendimento informado no sistema.",
  fora_escopo:
    "Consigo ajudar apenas com carros, reservas, pagamento, login e suporte do AgendaCar.",
  fallback:
    "Não entendi com segurança. Pode digitar de outra forma?",
  erro:
    "Tive um problema ao processar sua mensagem. Tente digitar novamente."
};

const INTENTS_CONFIG: IntentConfig[] = [
  {
    intent: "area_admin",
    prioridade: 1,
    termos: {
      "area admin": 8,
      "area administrativa": 8,
      "sou admin": 7,
      administrador: 6,
      "painel admin": 7,
      "cadastrar carro": 9,
      "cadastrar um carro": 9,
      "editar carro": 9,
      "remover carro": 9,
      "deletar carro": 9
    }
  },
  {
    intent: "cancelar_reserva",
    prioridade: 2,
    termos: {
      "cancelar minha reserva": 10,
      "cancelar reserva": 9,
      "cancela minha reserva": 10,
      "como cancelo minha reserva": 10,
      "como cancelo uma reserva": 9,
      "como cancelar uma reserva": 9,
      "desmarcar reserva": 9,
      "desfazer reserva": 9,
      cancelamento: 7,
      cancelar: 5,
      cancela: 5,
      cancelo: 5,
      desmarcar: 6,
      desfazer: 6,
      desistir: 6,
      "desistir da reserva": 9,
      "remover reserva": 9
    }
  },
  {
    intent: "alterar_reserva",
    prioridade: 3,
    termos: {
      "alterar minha reserva": 10,
      "alterar reserva": 9,
      "mudar a data": 9,
      "mudar data da reserva": 10,
      "mudar data": 8,
      "trocar data da reserva": 10,
      "trocar data": 8,
      remarcar: 7,
      "editar reserva": 8,
      "data errada": 7,
      reagendar: 7,
      "reagendar reserva": 9
    }
  },
  {
    intent: "minhas_reservas",
    prioridade: 4,
    termos: {
      "onde vejo minhas reservas": 10,
      "minhas reservas": 10,
      "ver minhas reservas": 10,
      "consultar minhas reservas": 10,
      "quero ver minha reserva": 10,
      "onde esta minha reserva": 10,
      "historico de reservas": 8,
      "reservas feitas": 8,
      "minhas locacoes": 8,
      "meus agendamentos": 8,
      "status da reserva": 7
    }
  },
  {
    intent: "pagamento",
    prioridade: 5,
    termos: {
      "pagar minha reserva": 9,
      "confirma meu pagamento": 9,
      "confirme meu pagamento": 9,
      "confirmar pagamento": 8,
      pagamento: 6,
      pagar: 6,
      pix: 6,
      cartao: 6,
      boleto: 6,
      comprovante: 6,
      "valor total": 5
    }
  },
  {
    intent: "problema_login",
    prioridade: 6,
    termos: {
      "nao consigo entrar": 8,
      "login nao funciona": 8,
      "erro no login": 8,
      "senha errada": 7,
      "esqueci minha senha": 8,
      "email invalido": 6,
      "problema no cadastro": 6
    }
  },
  {
    intent: "login_cadastro",
    prioridade: 7,
    termos: {
      login: 5,
      "entrar na conta": 7,
      "criar conta": 7,
      cadastro: 5,
      "fazer cadastro": 7,
      "acessar minha conta": 7
    }
  },
  {
    intent: "suporte_humano",
    prioridade: 8,
    termos: {
      "suporte humano": 8,
      "falar com atendente": 8,
      "falar com alguem": 7,
      atendimento: 5,
      responsavel: 5,
      suporte: 5
    }
  },
  {
    intent: "reservar_carro",
    prioridade: 9,
    termos: {
      "quero reservar um carro": 10,
      "reservar um carro": 9,
      "reservar carro": 8,
      "quero alugar um carro": 10,
      "alugar um carro": 9,
      "preciso de um carro": 9,
      "quero locar um veiculo": 9,
      "locar carro": 8,
      "agendar carro": 8,
      "carro para amanha": 7,
      "carro para o fim de semana": 7
    }
  },
  {
    intent: "consultar_carros",
    prioridade: 10,
    termos: {
      "me mostra todos os carros": 10,
      "mostra todos os carros": 10,
      "todos os carros": 9,
      "quais carros voces tem": 9,
      "quais carros": 9,
      "carros disponiveis": 9,
      "modelos disponiveis": 8,
      "quero ver os carros": 9,
      "ver carros": 8,
      "mostrar carros": 8,
      "mostra carros": 8,
      "mostre os carros": 8,
      "listar carros": 8,
      "liste os carros": 8,
      "tem carro automatico": 9,
      "tem carro manual": 9,
      "tem suv": 8,
      "lista de carros": 8
    }
  },
  {
    intent: "recomendacao_carro",
    prioridade: 13,
    termos: {
      "me recomenda": 9,
      "recomenda um carro": 9,
      "qual carro voce recomenda": 9,
      "melhor carro": 7,
      "carro para viagem": 7,
      "carro para familia": 7,
      "carro esportivo": 7,
      "carro economico": 7,
      "carro barato": 6
    }
  },
  {
    intent: "filtros_carros",
    prioridade: 12,
    termos: {
      filtrar: 7,
      filtro: 7,
      ordenar: 7,
      "menor preco": 8,
      "maior preco": 8,
      "por capacidade": 7,
      "buscar por modelo": 7
    }
  },
  {
    intent: "saudacao",
    prioridade: 14,
    termos: {
      oi: 4,
      ola: 4,
      "bom dia": 5,
      "boa tarde": 5,
      "boa noite": 5,
      ajuda: 3
    }
  },
  {
    intent: "agradecimento",
    prioridade: 15,
    termos: {
      obrigado: 6,
      obrigada: 6,
      valeu: 6,
      vlw: 6
    }
  },
  {
    intent: "despedida",
    prioridade: 16,
    termos: {
      tchau: 6,
      "ate mais": 6,
      falou: 5,
      sair: 4,
      encerrar: 5
    }
  }
];

class ChatbotService {
  async responder(
    mensagem: string,
    sender = "usuario-agendacar"
  ): Promise<ChatbotResponse> {
    try {
      const textoOriginal = mensagem.trim();
      const texto = this.normalizar(textoOriginal);

      if (!texto) {
        return this.montarResposta("fallback", RESPOSTAS.fallback, 0, []);
      }

      const classificacao = this.classificarIntencao(texto);

      if (classificacao.ambigua) {
        return this.montarResposta(
          "fallback",
          this.montarPerguntaAmbigua(classificacao.ambigua),
          classificacao.confidence,
          []
        );
      }

      if (classificacao.intent === "fora_escopo" || classificacao.intent === "fallback") {
        return this.montarResposta(
          classificacao.intent,
          this.respostaFallbackPorTexto(texto, classificacao.intent),
          classificacao.confidence,
          []
        );
      }

      if (INTENTS_COM_CARDS.has(classificacao.intent)) {
        return this.responderComCards(classificacao, texto);
      }

      if (classificacao.intent === "saudacao" && texto === "ajuda") {
        return this.montarResposta("ajuda_geral", RESPOSTAS.ajuda_geral, 0.75, []);
      }

      if (classificacao.confidence >= 0.55) {
        return this.montarResposta(
          classificacao.intent,
          RESPOSTAS[classificacao.intent],
          classificacao.confidence,
          []
        );
      }

      try {
        const respostaRasa = await this.enviarParaRasa(textoOriginal, sender);
        return this.montarResposta("fallback", respostaRasa, 0.45, []);
      } catch {
        return this.montarResposta("fallback", RESPOSTAS.fallback, 0.35, []);
      }
    } catch {
      return this.montarResposta("erro", RESPOSTAS.erro, 0, []);
    }
  }

  private classificarIntencao(texto: string): Classificacao {
    const critica = this.classificarIntencaoCritica(texto);
    if (critica) {
      return critica;
    }

    if (this.ehForaDeEscopo(texto)) {
      return { intent: "fora_escopo", confidence: 0.95 };
    }

    const generica = this.classificarTermoGenerico(texto);

    if (generica) {
      return generica;
    }

    const scores = INTENTS_CONFIG
      .map((config) => {
        let score = 0;
        let hits = 0;

        for (const [termo, peso] of Object.entries(config.termos)) {
          if (this.contemTermo(texto, termo)) {
            score += peso;
            hits += 1;
          }
        }

        return { ...config, score, hits };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.prioridade - b.prioridade;
      });

    if (!scores.length) {
      return { intent: "fallback", confidence: 0.35 };
    }

    const melhor = scores[0];
    const segundo = scores[1];

    if (melhor.score < 5 && melhor.intent !== "saudacao") {
      return { intent: "fallback", confidence: 0.45 };
    }

    if (
      segundo &&
      segundo.score >= 5 &&
      melhor.score - segundo.score <= 1 &&
      Math.abs(melhor.prioridade - segundo.prioridade) > 1
    ) {
      return {
        intent: "fallback",
        confidence: 0.5,
        ambigua: [melhor.intent, segundo.intent]
      };
    }

    return {
      intent: melhor.intent,
      confidence: Number(Math.min(0.98, Math.max(0.55, melhor.score / 10)).toFixed(2))
    };
  }

  private classificarIntencaoCritica(texto: string): Classificacao | null {
    const falaDeReserva = this.temAlgumaPalavra(texto, [
      "reserva",
      "reservas",
      "agendamento",
      "agendamentos",
      "locacao",
      "locacoes"
    ]);

    if (
      falaDeReserva &&
      this.temAlgumaPalavra(texto, [
        "cancelar",
        "cancela",
        "cancelo",
        "desmarcar",
        "desfazer",
        "remover",
        "desistir"
      ])
    ) {
      return { intent: "cancelar_reserva", confidence: 0.98 };
    }

    if (
      falaDeReserva &&
      this.temAlgumaPalavra(texto, [
        "alterar",
        "mudar",
        "trocar",
        "editar",
        "remarcar",
        "reagendar",
        "modificar"
      ])
    ) {
      return { intent: "alterar_reserva", confidence: 0.98 };
    }

    if (
      this.contemTermo(texto, "minhas reservas") ||
      this.contemTermo(texto, "ver minhas reservas") ||
      this.contemTermo(texto, "consultar minhas reservas") ||
      this.contemTermo(texto, "minhas locacoes") ||
      this.contemTermo(texto, "meus agendamentos") ||
      (falaDeReserva && this.temAlgumaPalavra(texto, ["minhas", "meus", "vejo", "ver", "consultar"]))
    ) {
      return { intent: "minhas_reservas", confidence: 0.98 };
    }

    if (
      falaDeReserva &&
      this.temAlgumaPalavra(texto, ["pagar", "pagamento", "pix", "cartao", "boleto", "comprovante"])
    ) {
      return { intent: "pagamento", confidence: 0.96 };
    }

    return null;
  }

  private classificarTermoGenerico(texto: string): Classificacao | null {
    if (["reserva", "reservas", "carro", "carros", "pagamento", "ajuda"].includes(texto)) {
      return { intent: "fallback", confidence: 0.45 };
    }

    if (/^[?/\s.!,]+$/.test(texto)) {
      return { intent: "fallback", confidence: 0 };
    }

    return null;
  }

  private async responderComCards(
    classificacao: Classificacao,
    texto: string
  ): Promise<ChatbotResponse> {
    const carros = await this.listarTodosOsCarros();

    if (!carros.length) {
      return this.montarResposta(
        classificacao.intent,
        "Nao encontrei carros cadastrados no momento. Tente novamente mais tarde ou fale com o suporte.",
        classificacao.confidence,
        []
      );
    }

    const filtrados = this.filtrarCarros(carros, texto, classificacao.intent);
    const cards = filtrados.slice(0, 4).map((carro) => this.montarCard(carro));

    if (!cards.length) {
      return this.montarResposta(
        classificacao.intent,
        "Nao encontrei carros com esse perfil. Tente mudar o tipo, orcamento ou consulte todos os modelos na tela inicial.",
        classificacao.confidence,
        []
      );
    }

    return this.montarResposta(
      classificacao.intent,
      this.montarRespostaComCards(classificacao.intent, cards),
      classificacao.confidence,
      cards
    );
  }

  private montarRespostaComCards(intent: ChatbotIntent, cards: ChatbotCard[]) {
    if (intent === "consultar_carros") {
      return "Encontrei os carros disponíveis. Confira os cards abaixo.";
    }

    return RESPOSTAS[intent];
  }

  private filtrarCarros(
    carros: CarroNormalizado[],
    texto: string,
    intent: ChatbotIntent
  ): CarroNormalizado[] {
    let resultado = [...carros];
    const tipo = this.extrairTipo(texto);
    const transmissao = this.extrairTransmissao(texto);
    const precoMaximo = this.extrairPrecoMaximo(texto);
    const minCapacidade = this.extrairCapacidade(texto);
    const modelo = this.extrairModelo(texto, carros);

    if (modelo) resultado = resultado.filter((carro) => carro.id === modelo.id);

    if (tipo) {
      resultado = resultado.filter((carro) =>
        this.normalizar(`${carro.tipo} ${carro.nome}`).includes(tipo)
      );
    }

    if (transmissao) {
      resultado = resultado.filter((carro) =>
        this.normalizar(carro.transmissao).includes(transmissao)
      );
    }

    if (precoMaximo) resultado = resultado.filter((carro) => carro.precoDia <= precoMaximo);
    if (minCapacidade) resultado = resultado.filter((carro) => carro.capacidade >= minCapacidade);
    if (intent === "reservar_carro") resultado = resultado.filter((carro) => carro.disponivel);

    return resultado.sort((a, b) => a.precoDia - b.precoDia);
  }

  private montarResposta(
    intent: ChatbotIntent,
    resposta: string,
    confidence: number,
    cards: ChatbotCard[]
  ): ChatbotResponse {
    const showCards = INTENTS_COM_CARDS.has(intent) && cards.length > 0;

    return {
      resposta,
      origem: intent === "fallback" ? "fallback" : "sistema",
      intent,
      confidence: Number(confidence.toFixed(2)),
      showCards,
      cards: showCards ? cards : [],
      error: intent === "erro"
    };
  }

  private montarPerguntaAmbigua(intents: [ChatbotIntent, ChatbotIntent]) {
    const nomes: Record<string, string> = {
      reservar_carro: "criar uma nova reserva",
      cancelar_reserva: "cancelar uma reserva",
      alterar_reserva: "alterar uma reserva",
      minhas_reservas: "consultar suas reservas",
      pagamento: "falar sobre pagamento",
      consultar_carros: "ver carros disponíveis"
    };

    return `Fiquei em dúvida se você quer ${nomes[intents[0]] || intents[0]} ou ${nomes[intents[1]] || intents[1]}. Pode confirmar em uma frase curta?`;
  }

  private respostaFallbackPorTexto(texto: string, intent: ChatbotIntent) {
    if (intent === "fora_escopo") return RESPOSTAS.fora_escopo;

    if (texto === "reserva" || texto === "reservas") {
      return "Você quer criar, consultar, alterar ou cancelar uma reserva?";
    }

    if (texto === "carro" || texto === "carros") {
      return "Você quer consultar carros disponíveis, reservar um carro ou receber uma recomendação?";
    }

    return RESPOSTAS.fallback;
  }

  private async listarTodosOsCarros(): Promise<CarroNormalizado[]> {
    const carros = await carroService.listar({});

    return carros.map((carro: any) => {
      const dados = typeof carro.get === "function" ? carro.get({ plain: true }) : carro;

      return {
        id: dados.id,
        nome: dados.nome,
        tipo: dados.tipo,
        imagem: dados.imagem,
        capacidade: Number(dados.capacidade),
        transmissao: dados.transmissao,
        tanque: Number(dados.tanque),
        precoDia: Number(dados.precoDia),
        disponivel: Boolean(dados.disponivel)
      };
    });
  }

  private montarCard(carro: CarroNormalizado): ChatbotCard {
    return {
      id: carro.id,
      nome: carro.nome,
      tipo: carro.tipo,
      imagem: carro.imagem,
      capacidade: carro.capacidade,
      transmissao: carro.transmissao,
      tanque: carro.tanque,
      precoDia: carro.precoDia,
      disponivel: carro.disponivel,
      acaoTexto: carro.disponivel ? "Reservar agora" : "Indisponivel",
      url: `/carros/${carro.id}`
    };
  }

  private extrairTipo(texto: string): string | null {
    if (this.temAlgumaPalavra(texto, ["suv", "familia", "viagem"])) return "suv";
    if (this.temAlgumaPalavra(texto, ["sport", "esportivo", "luxo", "performance"])) return "sport";
    if (this.temAlgumaPalavra(texto, ["picape", "pickup", "caminhonete"])) return "picape";
    if (this.temAlgumaPalavra(texto, ["sedan"])) return "sedan";
    return null;
  }

  private extrairTransmissao(texto: string): string | null {
    if (this.contemTermo(texto, "automatico")) return "automatico";
    if (this.contemTermo(texto, "manual")) return "manual";
    return null;
  }

  private extrairPrecoMaximo(texto: string): number | null {
    const padroes = [
      /ate\s*r?\$?\s*(\d{2,6})/,
      /maximo\s*r?\$?\s*(\d{2,6})/,
      /orcamento\s*r?\$?\s*(\d{2,6})/,
      /r\$\s*(\d{2,6})/,
      /(\d{2,6})\s*reais/
    ];

    for (const padrao of padroes) {
      const match = texto.match(padrao);
      if (match?.[1]) return Number(match[1]);
    }

    return null;
  }

  private extrairCapacidade(texto: string): number | null {
    const match = texto.match(/(\d+)\s*(pessoas|passageiros|lugares)/);
    if (match?.[1]) return Number(match[1]);
    if (this.contemTermo(texto, "familia")) return 5;
    return null;
  }

  private extrairModelo(texto: string, carros: CarroNormalizado[]) {
    const textoLimpo = this.removerTermosComuns(texto);
    if (!textoLimpo || textoLimpo.length < 2) return null;

    return carros.find((carro) =>
      this.normalizar(carro.nome)
        .split(" ")
        .some((parte) => parte.length > 1 && textoLimpo.includes(parte))
    ) || null;
  }

  private async enviarParaRasa(mensagem: string, sender: string): Promise<string> {
    const baseUrl = process.env.RASA_BASE_URL || "http://localhost:5005";

    const response = await fetch(`${baseUrl}/webhooks/rest/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, message: mensagem })
    });

    if (!response.ok) throw new Error("Erro ao consultar o Rasa.");

    const data = (await response.json()) as RasaMessage[];
    const textos = data
      .map((item) => item.text)
      .filter((item): item is string => Boolean(item));

    return textos.join("\n") || RESPOSTAS.fallback;
  }

  private ehForaDeEscopo(texto: string) {
    const termos = [
      "capital da franca",
      "previsao do tempo",
      "dolar",
      "receita",
      "filme",
      "futebol",
      "piada",
      "poesia",
      "musica",
      "cagar",
      "merda",
      "bosta",
      "porra",
      "caralho",
      "fodase"
    ];

    return termos.some((termo) => this.contemTermo(texto, termo));
  }

  private removerTermosComuns(texto: string) {
    return texto
      .replace(/\b(quero|ver|mostrar|mostra|mostre|listar|liste|tem|carro|carros|veiculo|veiculos|modelo|reservar|alugar|locar|agendar|disponivel|pra|para|um|uma|o|a|de|da|do|com|por|favor|todos|os)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private contemTermo(texto: string, termo: string): boolean {
    const termoNormalizado = this.normalizar(termo);
    if (termoNormalizado.includes(" ")) return texto.includes(termoNormalizado);
    return new RegExp(`\\b${termoNormalizado}\\b`).test(texto);
  }

  private temAlgumaPalavra(texto: string, palavras: string[]): boolean {
    return palavras.some((palavra) => this.contemTermo(texto, palavra));
  }

  private normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export default new ChatbotService();
