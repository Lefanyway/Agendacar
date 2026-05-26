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

interface AliasCarro {
  busca: string;
  termos: string[];
}

class ChatbotService {
  async responder(
    mensagem: string,
    sender = "usuario-agendacar"
  ): Promise<ChatbotResponse> {
    const texto = mensagem.trim();

    if (!texto) {
      return {
        resposta: "Digite uma mensagem para eu conseguir ajudar.",
        origem: "fallback"
      };
    }

    if (this.ehMensagemInvalida(texto)) {
      return {
        resposta:
          "Não entendi muito bem. Posso ajudar com carros, reservas, pagamento, login, área administrativa ou recomendações.",
        origem: "fallback"
      };
    }

    const respostaLocal = await this.responderComRegrasDoSistema(texto);

    if (respostaLocal) {
      return respostaLocal;
    }

    try {
      return await this.enviarParaRasa(texto, sender);
    } catch {
      return this.respostaFallbackInteligente(texto);
    }
  }

  private async responderComRegrasDoSistema(
    mensagem: string
  ): Promise<ChatbotResponse | null> {
    const texto = this.normalizar(mensagem);

    const respostaCarro = await this.responderSobreCarros(texto);

    if (respostaCarro) {
      return respostaCarro;
    }

    if (this.temAlgumaPalavra(texto, ["reservar", "reserva", "alugar", "agendar"])) {
      return {
        resposta:
          "Para reservar, escolha um carro disponível, abra os detalhes do veículo, informe as datas e confirme a reserva. Se quiser, me diga o modelo do carro, por exemplo: “m3”, “gr”, “tt” ou “sw4”.",
        origem: "sistema"
      };
    }

    if (this.temAlgumaPalavra(texto, ["cancelar", "cancelamento", "desmarcar"])) {
      return {
        resposta:
          "Para cancelar uma reserva, acesse “Minhas Reservas” e clique na opção de cancelamento da reserva desejada.",
        origem: "sistema"
      };
    }

    if (this.temAlgumaPalavra(texto, ["pagamento", "pagar", "pix", "cartao", "cartão", "valor", "preco", "preço"])) {
      return {
        resposta:
          "O pagamento é feito após escolher o carro e confirmar o período da reserva. Antes de finalizar, confira o veículo, as datas e o valor total.",
        origem: "sistema"
      };
    }

    if (this.temAlgumaPalavra(texto, ["login", "entrar", "cadastro", "cadastrar", "senha", "conta"])) {
      return {
        resposta:
          "Você pode criar uma conta ou entrar com e-mail e senha pela tela de login. Para fazer reservas e acessar seus agendamentos, é necessário estar autenticado.",
        origem: "sistema"
      };
    }

    if (this.temAlgumaPalavra(texto, ["admin", "administrador", "painel", "gerenciar", "crud"])) {
      return {
        resposta:
          "A área administrativa permite cadastrar, editar e remover carros. O acesso é restrito a usuários administradores.",
        origem: "sistema"
      };
    }

    if (this.temAlgumaPalavra(texto, ["recomenda", "recomendacao", "recomendação", "indica", "indicar", "sugere", "sugerir"])) {
      return {
        resposta:
          "Posso te ajudar a escolher. Me diga algo como: “quero um carro esportivo”, “quero um carro para família”, “quero um automático” ou “quero um carro até 1000 reais”.",
        origem: "sistema"
      };
    }

    if (this.temAlgumaPalavra(texto, ["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "ajuda"])) {
      return {
        resposta:
          "Olá! Sou o assistente do AgendaCar. Posso ajudar com carros, reservas, pagamento, login, área administrativa e recomendações. Você pode perguntar, por exemplo: “tem m3?”, “quero ver o gr”, “quais carros estão disponíveis?” ou “como faço uma reserva?”.",
        origem: "sistema"
      };
    }

    if (this.temAlgumaPalavra(texto, ["obrigado", "obrigada", "valeu", "vlw"])) {
      return {
        resposta: "De nada! Quando quiser consultar ou reservar um carro, é só chamar.",
        origem: "sistema"
      };
    }

    return null;
  }

  private async responderSobreCarros(texto: string): Promise<ChatbotResponse | null> {
    const carros = await this.listarTodosOsCarros();

    if (!carros.length) {
      return {
        resposta:
          "Não encontrei carros cadastrados no momento. Tente novamente mais tarde ou fale com um administrador.",
        origem: "sistema"
      };
    }

    const carroPorAlias = this.encontrarCarroPorAlias(texto, carros);

    if (carroPorAlias) {
      return this.montarRespostaCarroEspecifico(carroPorAlias);
    }

    const filtros = this.extrairFiltros(texto);
    const mensagemFalaDeCarro = this.mensagemFalaDeCarro(texto);

    if (!mensagemFalaDeCarro && !filtros.temFiltro) {
      return null;
    }

    let carrosFiltrados = carros;

    if (filtros.apenasDisponiveis) {
      carrosFiltrados = carrosFiltrados.filter((carro) => carro.disponivel);
    }

    if (filtros.tipo) {
      carrosFiltrados = carrosFiltrados.filter((carro) =>
        this.normalizar(carro.tipo).includes(filtros.tipo as string)
      );
    }

    if (filtros.transmissao) {
      carrosFiltrados = carrosFiltrados.filter((carro) =>
        this.normalizar(carro.transmissao).includes(filtros.transmissao as string)
      );
    }

    if (filtros.minCapacidade) {
      carrosFiltrados = carrosFiltrados.filter(
        (carro) => carro.capacidade >= (filtros.minCapacidade as number)
      );
    }

    if (filtros.precoMaximo) {
      carrosFiltrados = carrosFiltrados.filter(
        (carro) => carro.precoDia <= (filtros.precoMaximo as number)
      );
    }

    if (filtros.ordenarPorPreco) {
      carrosFiltrados = [...carrosFiltrados].sort((a, b) => a.precoDia - b.precoDia);
    }

    if (!carrosFiltrados.length) {
      return {
        resposta:
          "Não encontrei carros disponíveis com esse perfil agora. Você pode tentar outro modelo, outro orçamento ou consultar a lista completa de veículos.",
        origem: "sistema"
      };
    }

    const cards = carrosFiltrados.slice(0, 4).map((carro) => this.montarCard(carro));

    return {
      resposta: this.montarTextoListaCarros(cards, filtros),
      origem: "sistema",
      cards
    };
  }

  private montarRespostaCarroEspecifico(carro: CarroNormalizado): ChatbotResponse {
    const card = this.montarCard(carro);

    if (!carro.disponivel) {
      return {
        resposta: `${carro.nome} existe na frota, mas não está disponível para reserva no momento. Você pode consultar outras opções disponíveis.`,
        origem: "sistema",
        cards: [card]
      };
    }

    return {
      resposta: `${carro.nome} está disponível. Confira os dados e clique para reservar.`,
      origem: "sistema",
      cards: [card]
    };
  }

  private montarTextoListaCarros(cards: ChatbotCard[], filtros: ReturnType<typeof this.extrairFiltros>): string {
    if (cards.length === 1) {
      return `Encontrei uma opção para você: ${cards[0].nome}. Confira o card abaixo para reservar.`;
    }

    if (filtros.precoMaximo) {
      return `Encontrei ${cards.length} opção(ões) dentro do orçamento informado. Confira os cards abaixo.`;
    }

    if (filtros.tipo === "sport" || filtros.tipo === "esportivo") {
      return `Encontrei opções com perfil esportivo. Confira os cards abaixo.`;
    }

    if (filtros.tipo === "suv") {
      return `Encontrei opções SUV para você. Confira os cards abaixo.`;
    }

    if (filtros.minCapacidade && filtros.minCapacidade >= 5) {
      return `Encontrei opções com boa capacidade de passageiros. Confira os cards abaixo.`;
    }

    return `Encontrei ${cards.length} carro(s) para você. Confira os cards abaixo.`;
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

  private encontrarCarroPorAlias(
    texto: string,
    carros: CarroNormalizado[]
  ): CarroNormalizado | null {
    const aliases = this.aliasesDeCarros();

    for (const alias of aliases) {
      const encontrou = alias.termos.some((termo) =>
        this.contemTermo(texto, this.normalizar(termo))
      );

      if (!encontrou) {
        continue;
      }

      const buscaNormalizada = this.normalizar(alias.busca);

      const carro = carros.find((item) =>
        this.normalizar(item.nome).includes(buscaNormalizada)
      );

      if (carro) {
        return carro;
      }
    }

    const textoLimpo = this.limparTextoDeBusca(texto);

    if (!textoLimpo || textoLimpo.length < 2) {
      return null;
    }

    const candidatos = carros
      .map((carro) => ({
        carro,
        score: this.calcularScoreSimilaridade(textoLimpo, this.normalizar(carro.nome))
      }))
      .sort((a, b) => b.score - a.score);

    if (candidatos[0]?.score >= 0.52) {
      return candidatos[0].carro;
    }

    return null;
  }

  private aliasesDeCarros(): AliasCarro[] {
    return [
      {
        busca: "BMW M3",
        termos: [
          "bmw m3",
          "m3",
          "m 3",
          "m-3",
          "m três",
          "m tres",
          "m3 competition",
          "competition",
          "bmw competition",
          "bmw",
          "bimmer"
        ]
      },
      {
        busca: "Audi TT",
        termos: [
          "audi tt",
          "audi tt rs",
          "tt",
          "tt rs",
          "ttrs",
          "audi rs",
          "auditt",
          "audi"
        ]
      },
      {
        busca: "Toyota GR Corolla",
        termos: [
          "toyota gr",
          "gr corolla",
          "gr",
          "g r",
          "g-r",
          "corolla gr",
          "corolla",
          "grc",
          "gazoo",
          "toyota gazoo"
        ]
      },
      {
        busca: "Toyota SW4",
        termos: [
          "toyota sw4",
          "sw4",
          "sw 4",
          "sw-4",
          "hilux sw4",
          "suv 7 lugares",
          "7 lugares",
          "sete lugares",
          "toyota suv"
        ]
      },
      {
        busca: "Porsche 911",
        termos: [
          "porsche",
          "porsche 911",
          "911",
          "nove onze",
          "carrera",
          "porshe",
          "porche"
        ]
      },
      {
        busca: "T-Cross",
        termos: [
          "t-cross",
          "tcross",
          "t cross",
          "volkswagen t cross",
          "vw t cross"
        ]
      },
      {
        busca: "Civic",
        termos: [
          "civic",
          "civic type r",
          "type r",
          "type-r",
          "honda civic"
        ]
      },
      {
        busca: "Silverado",
        termos: [
          "silverado",
          "chevrolet silverado",
          "picape",
          "pickup",
          "caminhonete"
        ]
      },
      {
        busca: "Audi Q8",
        termos: [
          "audi q8",
          "q8",
          "q 8",
          "audi suv"
        ]
      }
    ];
  }

  private extrairFiltros(texto: string) {
    const precoMaximo = this.extrairPrecoMaximo(texto);
    const minCapacidade = this.extrairCapacidade(texto);

    let tipo: string | null = null;
    let transmissao: string | null = null;
    let ordenarPorPreco = false;

    if (this.temAlgumaPalavra(texto, ["suv", "familia", "família", "viagem", "espacoso", "espaçoso"])) {
      tipo = "suv";
    }

    if (this.temAlgumaPalavra(texto, ["sport", "esportivo", "esportiva", "rapido", "rápido", "performance", "corrida"])) {
      tipo = "sport";
    }

    if (this.temAlgumaPalavra(texto, ["manual"])) {
      transmissao = "manual";
    }

    if (this.temAlgumaPalavra(texto, ["automatico", "automático"])) {
      transmissao = "automatico";
    }

    if (this.temAlgumaPalavra(texto, ["barato", "economico", "econômico", "menor preco", "menor preço", "mais em conta"])) {
      ordenarPorPreco = true;
    }

    return {
      tipo,
      transmissao,
      minCapacidade,
      precoMaximo,
      ordenarPorPreco,
      apenasDisponiveis: this.temAlgumaPalavra(texto, [
        "disponivel",
        "disponível",
        "disponiveis",
        "disponíveis",
        "reservar",
        "reserva",
        "alugar",
        "agendar",
        "tem",
        "quero",
        "mostra",
        "ver"
      ]),
      temFiltro: Boolean(tipo || transmissao || minCapacidade || precoMaximo || ordenarPorPreco)
    };
  }

  private extrairPrecoMaximo(texto: string): number | null {
    const padroes = [
      /ate\s*r?\$?\s*(\d{2,6})/,
      /até\s*r?\$?\s*(\d{2,6})/,
      /maximo\s*r?\$?\s*(\d{2,6})/,
      /máximo\s*r?\$?\s*(\d{2,6})/,
      /orcamento\s*r?\$?\s*(\d{2,6})/,
      /orçamento\s*r?\$?\s*(\d{2,6})/,
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

    if (texto.includes("familia") || texto.includes("família")) {
      return 5;
    }

    if (texto.includes("sete lugares")) {
      return 7;
    }

    return null;
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
        resposta:
          "Não entendi. Pergunte sobre carros, reservas, pagamento, login ou recomendações.",
        origem: "rasa"
      };
    }

    return {
      resposta: textos.join("\n"),
      origem: "rasa"
    };
  }

  private respostaFallbackInteligente(mensagem: string): ChatbotResponse {
    const texto = this.normalizar(mensagem);

    if (this.temAlgumaPalavra(texto, ["carro", "carros", "veiculo", "veículo"])) {
      return {
        resposta:
          "Posso ajudar com carros disponíveis, modelos, preço, capacidade e reservas. Tente perguntar: “quero ver os carros disponíveis” ou “tem m3?”.",
        origem: "fallback"
      };
    }

    return {
      resposta:
        "Não consegui conectar ao chatbot agora, mas posso ajudar com carros, reservas, pagamento, login, área administrativa e recomendações.",
      origem: "fallback"
    };
  }

  private mensagemFalaDeCarro(texto: string): boolean {
    return this.temAlgumaPalavra(texto, [
      "carro",
      "carros",
      "veiculo",
      "veículo",
      "veiculos",
      "veículos",
      "modelo",
      "modelos",
      "disponivel",
      "disponível",
      "disponiveis",
      "disponíveis",
      "reservar",
      "alugar",
      "agendar",
      "mostra",
      "mostrar",
      "ver",
      "quero",
      "tem"
    ]);
  }

  private contemTermo(texto: string, termo: string): boolean {
    const textoCompacto = texto.replace(/[\s-]/g, "");
    const termoCompacto = termo.replace(/[\s-]/g, "");

    if (texto.includes(termo)) {
      return true;
    }

    if (textoCompacto.includes(termoCompacto)) {
      return true;
    }

    return false;
  }

  private limparTextoDeBusca(texto: string): string {
    return texto
      .replace(/\b(quero|ver|mostrar|mostra|tem|carro|veiculo|veículo|modelo|reservar|alugar|agendar|disponivel|disponível|pra|para|um|uma|o|a|de|da|do)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private calcularScoreSimilaridade(entrada: string, nomeCarro: string): number {
    const palavrasEntrada = entrada.split(" ").filter(Boolean);
    const palavrasCarro = nomeCarro.split(" ").filter(Boolean);

    let score = 0;

    for (const palavraEntrada of palavrasEntrada) {
      for (const palavraCarro of palavrasCarro) {
        if (palavraCarro.includes(palavraEntrada) || palavraEntrada.includes(palavraCarro)) {
          score += 0.35;
        }

        const distancia = this.distanciaLevenshtein(palavraEntrada, palavraCarro);
        const maior = Math.max(palavraEntrada.length, palavraCarro.length);
        const similaridade = maior ? 1 - distancia / maior : 0;

        if (similaridade >= 0.72) {
          score += similaridade * 0.3;
        }
      }
    }

    if (nomeCarro.includes(entrada)) {
      score += 0.6;
    }

    return Math.min(score, 1);
  }

  private distanciaLevenshtein(a: string, b: string): number {
    const matriz: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matriz[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matriz[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matriz[i][j] = matriz[i - 1][j - 1];
        } else {
          matriz[i][j] = Math.min(
            matriz[i - 1][j - 1] + 1,
            matriz[i][j - 1] + 1,
            matriz[i - 1][j] + 1
          );
        }
      }
    }

    return matriz[b.length][a.length];
  }

  private temAlgumaPalavra(texto: string, palavras: string[]): boolean {
    return palavras.some((palavra) => texto.includes(this.normalizar(palavra)));
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