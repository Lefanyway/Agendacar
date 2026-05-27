import carroService from "./CarroService";

type ChatbotOrigem = "rasa" | "fallback" | "sistema";

type ChatbotIntent =
  | "saudacao"
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
  | "fallback";

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
  "reservar_carro",
  "consultar_carros",
  "consultar_modelo",
  "filtros_carros",
  "recomendacao_carro"
]);

const INTENTS_CONFIG: IntentConfig[] = [
  {
    intent: "problema_login",
    prioridade: 1,
    termos: {
      "nao consigo entrar": 8,
      "login nao funciona": 8,
      "erro no login": 8,
      "senha errada": 7,
      "esqueci minha senha": 7,
      "email invalido": 6,
      "problema no cadastro": 6
    }
  },
  {
    intent: "area_admin",
    prioridade: 1,
    termos: {
      "area admin": 7,
      "area administrativa": 7,
      "sou admin": 6,
      "administrador": 5,
      "painel admin": 6,
      "cadastrar carro": 7,
      "cadastrar um carro": 8,
      "cadastrar veiculo": 7,
      "cadastrar um veiculo": 8,
      "editar carro": 7,
      "editar um carro": 8,
      "remover carro": 7,
      "remover um carro": 8,
      "deletar carro": 7
    }
  },
  {
    intent: "cancelar_reserva",
    prioridade: 2,
    termos: {
      "cancelar minha reserva": 10,
      "cancelar reserva": 9,
      "como cancelo uma reserva": 9,
      "cancelamento": 7,
      "cancelar": 5,
      "desmarcar": 6,
      "desfazer": 6,
      "desistir": 6,
      "remover reserva": 9
    }
  },
  {
    intent: "alterar_reserva",
    prioridade: 3,
    termos: {
      "alterar minha reserva": 10,
      "alterar reserva": 9,
      "mudar a data": 8,
      "mudar data": 8,
      "trocar data": 8,
      "remarcar": 7,
      "editar reserva": 8,
      "trocar carro": 6,
      "data errada": 7
    }
  },
  {
    intent: "minhas_reservas",
    prioridade: 4,
    termos: {
      "minhas reservas": 10,
      "minha reserva": 7,
      "onde vejo minhas reservas": 10,
      "consultar minhas reservas": 10,
      "quero ver minha reserva": 10,
      "onde esta minha reserva": 10,
      "ver minhas reservas": 10,
      "ver reserva": 7,
      "consultar reserva": 7,
      "meus agendamentos": 8,
      "historico de reservas": 7,
      "reservas feitas": 8,
      "minhas locacoes": 8,
      "status da reserva": 7
    }
  },
  {
    intent: "pagamento",
    prioridade: 5,
    termos: {
      "pagar minha reserva": 9,
      "pagamento": 6,
      "pagar": 6,
      "pix": 6,
      "cartao": 6,
      "boleto": 6,
      "comprovante": 6,
      "confirmar pagamento": 8,
      "confirme meu pagamento": 8,
      "valor total": 5
    }
  },
  {
    intent: "suporte_humano",
    prioridade: 6,
    termos: {
      "suporte humano": 8,
      "falar com atendente": 8,
      "falar com alguem": 7,
      "atendimento": 5,
      "responsavel": 5,
      "suporte": 5
    }
  },
  {
    intent: "reservar_carro",
    prioridade: 7,
    termos: {
      "quero reservar um carro": 10,
      "reservar um carro": 9,
      "reservar carro": 8,
      "quero alugar um carro": 10,
      "alugar um carro": 9,
      "locar carro": 8,
      "agendar carro": 8,
      "carro para amanha": 7,
      "carro para o fim de semana": 7
    }
  },
  {
    intent: "consultar_carros",
    prioridade: 8,
    termos: {
      "quais carros": 9,
      "quais carros voces tem": 9,
      "carros disponiveis": 9,
      "ver carros": 8,
      "mostrar carros": 8,
      "mostra carros": 8,
      "mostre os carros": 8,
      "me mostra os carros": 9,
      "me mostra todos os carros": 10,
      "todos os carros": 9,
      "listar carros": 8,
      "liste os carros": 8,
      "modelos disponiveis": 8,
      "quero ver os carros": 9,
      "tem carro automatico": 9,
      "tem carro manual": 9,
      "tem suv": 8,
      "lista de carros": 8
    }
  },
  {
    intent: "recomendacao_carro",
    prioridade: 9,
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
    prioridade: 9,
    termos: {
      "filtrar": 7,
      "filtro": 7,
      "ordenar": 7,
      "menor preco": 8,
      "maior preco": 8,
      "por capacidade": 7,
      "buscar por modelo": 7
    }
  },
  {
    intent: "login_cadastro",
    prioridade: 1,
    termos: {
      "login": 5,
      "entrar na conta": 7,
      "criar conta": 7,
      "cadastro": 5,
      "cadastrar": 5,
      "acessar minha conta": 7
    }
  },
  {
    intent: "saudacao",
    prioridade: 10,
    termos: {
      "oi": 4,
      "ola": 4,
      "bom dia": 5,
      "boa tarde": 5,
      "boa noite": 5,
      "ajuda": 3
    }
  }
];

const RESPOSTAS: Record<ChatbotIntent, string> = {
  saudacao:
    "Olá! Posso ajudar com carros, reservas, pagamento, login, cancelamento, recomendações e área administrativa. Sobre qual assunto você quer falar?",
  ajuda_geral:
    "Posso ajudar com carros disponíveis, reserva, cancelamento, pagamento, login, recomendações e área administrativa.",
  consultar_carros:
    "Encontrei alguns carros para você. Confira os cards abaixo.",
  reservar_carro:
    "Claro. Escolha um carro disponível nos cards abaixo. Depois informe o período da reserva e confirme pelo sistema.",
  recomendacao_carro:
    "Encontrei algumas opções com base no que você pediu. Confira os cards abaixo e abra um carro para ver os detalhes.",
  filtros_carros:
    "Encontrei alguns carros com esse perfil. Confira os cards abaixo.",
  consultar_modelo:
    "Encontrei este modelo na frota. Confira o card abaixo.",
  cancelar_reserva:
    "Entendi que você quer cancelar uma reserva. Eu não cancelo automaticamente pelo chat. Acesse Minhas Reservas, escolha a reserva desejada e use a opção de cancelamento.",
  alterar_reserva:
    "Para alterar uma reserva, acesse Minhas Reservas e selecione a reserva desejada. Se o sistema não permitir edição direta, cancele e faça uma nova reserva com os dados corretos.",
  minhas_reservas:
    "Você pode consultar suas reservas acessando Minhas Reservas após fazer login.",
  pagamento:
    "O pagamento deve ser feito na etapa de finalização da reserva. Confira as opções disponíveis diretamente na tela de pagamento.",
  login_cadastro:
    "Use a tela de login para entrar com email e senha. Se ainda não tiver conta, faça o cadastro antes de reservar.",
  problema_login:
    "Confira email e senha digitados. Se o problema continuar, tente cadastrar novamente ou procure suporte. Por segurança, não envie senha pelo chat.",
  area_admin:
    "A área administrativa é restrita a usuários administradores e permite cadastrar, editar e remover carros da frota.",
  suporte_humano:
    "Se precisar de ajuda humana, procure o responsável pelo sistema ou o suporte informado pela equipe do AgendaCar.",
  fora_escopo:
    "Consigo ajudar apenas com assuntos do AgendaCar, como carros, reservas, pagamento, login, cancelamento e suporte.",
  fallback:
    "Não consegui entender com segurança. Você quer reservar um carro, consultar suas reservas, cancelar uma reserva ou falar sobre pagamento?"
};

class ChatbotService {
  async responder(
    mensagem: string,
    sender = "usuario-agendacar"
  ): Promise<ChatbotResponse> {
    const textoOriginal = mensagem.trim();
    const texto = this.normalizar(textoOriginal);

    if (!texto) {
      return this.montarResposta(
        "fallback",
        textoOriginal ? RESPOSTAS.fallback : "Digite uma mensagem para eu conseguir ajudar.",
        0.3,
        []
      );
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
  }

  private classificarIntencao(texto: string): Classificacao {
    if (this.ehForaDeEscopo(texto)) {
      return { intent: "fora_escopo", confidence: 0.95 };
    }

    const respostaGenerica = this.classificarTermoGenerico(texto);

    if (respostaGenerica) {
      return respostaGenerica;
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
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.prioridade - b.prioridade;
      });

    if (!scores.length) {
      return { intent: "fallback", confidence: 0.35 };
    }

    const melhor = scores[0];
    const segundo = scores[1];

    if (melhor.score < 5 && !["saudacao"].includes(melhor.intent)) {
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

    const confidence = Math.min(0.98, Math.max(0.55, melhor.score / 10));

    return {
      intent: melhor.intent,
      confidence: Number(confidence.toFixed(2))
    };
  }

  private classificarTermoGenerico(texto: string): Classificacao | null {
    if (texto === "reserva" || texto === "reservas") {
      return { intent: "fallback", confidence: 0.45 };
    }

    if (texto === "carro" || texto === "carros") {
      return { intent: "fallback", confidence: 0.45 };
    }

    if (texto === "pagamento" || texto === "ajuda") {
      return { intent: "fallback", confidence: 0.45 };
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
        "Não encontrei carros cadastrados no momento. Tente novamente mais tarde ou fale com o suporte.",
        classificacao.confidence,
        []
      );
    }

    const carrosFiltrados = this.filtrarCarros(carros, texto, classificacao.intent);
    const cards = carrosFiltrados.slice(0, 4).map((carro) => this.montarCard(carro));

    if (!cards.length) {
      return this.montarResposta(
        classificacao.intent,
        "Não encontrei carros com esse perfil. Tente mudar o tipo, orçamento ou consulte todos os modelos na tela inicial.",
        classificacao.confidence,
        []
      );
    }

    return this.montarResposta(
      classificacao.intent,
      RESPOSTAS[classificacao.intent],
      classificacao.confidence,
      cards
    );
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

    if (modelo) {
      resultado = resultado.filter((carro) => carro.id === modelo.id);
    }

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

    if (precoMaximo) {
      resultado = resultado.filter((carro) => carro.precoDia <= precoMaximo);
    }

    if (minCapacidade) {
      resultado = resultado.filter((carro) => carro.capacidade >= minCapacidade);
    }

    if (intent === "reservar_carro") {
      resultado = resultado.filter((carro) => carro.disponivel);
    }

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
      cards: showCards ? cards : []
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
    if (intent === "fora_escopo") {
      return RESPOSTAS.fora_escopo;
    }

    if (texto === "reserva" || texto === "reservas") {
      return "Você quer criar uma nova reserva, consultar suas reservas, alterar ou cancelar uma reserva?";
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
      acaoTexto: carro.disponivel ? "Reservar agora" : "Indisponível",
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

      if (match?.[1]) {
        return Number(match[1]);
      }
    }

    return null;
  }

  private extrairCapacidade(texto: string): number | null {
    const match = texto.match(/(\d+)\s*(pessoas|passageiros|lugares)/);

    if (match?.[1]) {
      return Number(match[1]);
    }

    if (this.contemTermo(texto, "familia")) {
      return 5;
    }

    return null;
  }

  private extrairModelo(texto: string, carros: CarroNormalizado[]) {
    const textoLimpo = this.removerTermosComuns(texto);

    if (!textoLimpo || textoLimpo.length < 2) {
      return null;
    }

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

    if (/^[?/\s.!,]+$/.test(texto)) {
      return false;
    }

    return termos.some((termo) => this.contemTermo(texto, termo));
  }

  private removerTermosComuns(texto: string) {
    return texto
      .replace(/\b(quero|ver|mostrar|mostra|tem|carro|carros|veiculo|veiculos|modelo|reservar|alugar|locar|agendar|disponivel|pra|para|um|uma|o|a|de|da|do|com|por|favor)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private contemTermo(texto: string, termo: string): boolean {
    const termoNormalizado = this.normalizar(termo);

    if (termoNormalizado.includes(" ")) {
      return texto.includes(termoNormalizado);
    }

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
      .replace(/ç/g, "c")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export default new ChatbotService();
