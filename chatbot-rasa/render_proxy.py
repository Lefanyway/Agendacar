import json
import os
import re
import unicodedata
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urljoin
from urllib.request import Request, urlopen


PUBLIC_PORT = int(os.environ.get("PORT", "10000"))
API_BASE_URL = (os.environ.get("AGENDA_API_URL") or os.environ.get("BACKEND_URL") or "").strip()
API_TIMEOUT_SECONDS = float(os.environ.get("AGENDA_API_TIMEOUT", "2.5"))

ESCOPO = (
    "carros, reservas, pagamento, login, cancelamento, recomendacoes e area administrativa"
)

COMMON_TYPOS = {
    "resarvar": "reservar",
    "resrvar": "reservar",
    "reservaçao": "reserva",
    "reservacao": "reserva",
    "veiculo": "carro",
    "veiculos": "carros",
    "disponivel": "disponivel",
    "disponiveis": "disponiveis",
    "pagamnto": "pagamento",
    "pagmanto": "pagamento",
    "cartao": "cartao",
    "cadastroo": "cadastro",
    "loguin": "login",
    "adimin": "admin",
    "admim": "admin",
}

INTENTS = {
    "reservar": {
        "keywords": {
            "como reservar": 4, "quero reservar": 4, "fazer reserva": 4,
            "reservar": 3, "reserva": 2, "alugar": 3, "locar": 3,
            "agendar": 3, "retirada": 2, "devolucao": 2,
        },
        "response": (
            "Para reservar, abra um card de carro, confira diaria, capacidade e disponibilidade, "
            "clique no veiculo desejado e informe o periodo. Depois revise os dados e avance para o pagamento."
        ),
    },
    "cancelar": {
        "keywords": {
            "cancelar minha reserva": 5, "cancelar reserva": 4, "cancelamento": 3, "cancelar": 4,
            "desmarcar": 3, "desistir": 2, "remover reserva": 4,
        },
        "response": (
            "Para cancelar, acesse Minhas Reservas e escolha a reserva que deseja cancelar. "
            "O sistema permite cancelar apenas reservas da conta logada."
        ),
    },
    "alterar": {
        "keywords": {
            "alterar reserva": 4, "mudar data": 4, "trocar data": 4,
            "editar reserva": 4, "modificar reserva": 4, "data errada": 3,
            "trocar carro": 3,
        },
        "response": (
            "No momento, a forma segura de alterar e cancelar a reserva atual e criar uma nova "
            "com o carro, datas e destino corretos."
        ),
    },
    "minhas_reservas": {
        "keywords": {
            "minhas reservas": 5, "meus agendamentos": 4, "ver reserva": 3,
            "reserva ativa": 3, "historico": 2, "acompanhar reserva": 4,
            "status da reserva": 4,
        },
        "response": (
            "Suas reservas ficam em Minhas Reservas. La voce acompanha carro, periodo, valor "
            "e status da reserva feita pela sua conta."
        ),
    },
    "pagamento": {
        "keywords": {
            "pagamento": 3, "pagar": 3, "cartao": 3, "pix": 2, "valor total": 4,
            "diaria": 3, "preco": 3, "parcelar": 3, "cobranca": 3,
        },
        "response": (
            "O pagamento vem depois da escolha do carro e do periodo. Antes de finalizar, confira "
            "veiculo, datas, destino e valor total da reserva."
        ),
    },
    "login": {
        "keywords": {
            "login": 3, "entrar": 2, "logar": 3, "criar conta": 4,
            "cadastro": 3, "cadastrar": 3, "senha": 2, "minha conta": 4,
        },
        "response": (
            "Use a tela de login para entrar com email e senha. Se ainda nao tiver conta, faca o cadastro. "
            "Reservas e pagamentos exigem usuario autenticado."
        ),
    },
    "problema_login": {
        "keywords": {
            "nao consigo entrar": 5, "erro no login": 5, "senha errada": 4,
            "esqueci senha": 4, "email invalido": 4, "login nao funciona": 5,
            "problema no cadastro": 4,
        },
        "response": (
            "Confira email e senha digitados. Se o problema continuar, tente cadastrar novamente ou procure suporte. "
            "Por seguranca, nao envie senha pelo chat."
        ),
    },
    "admin": {
        "keywords": {
            "admin": 3, "administrador": 3, "painel": 2, "area administrativa": 4,
            "cadastrar carro": 4, "editar carro": 4, "remover carro": 4,
            "gerenciar frota": 4,
        },
        "response": (
            "A area administrativa permite cadastrar, editar e remover carros. "
            "Ela e restrita a usuarios com perfil de administrador."
        ),
    },
    "suporte": {
        "keywords": {
            "suporte humano": 5, "falar com atendente": 5, "falar com alguem": 4,
            "atendimento": 3, "responsavel": 3, "suporte": 3,
        },
        "response": (
            "Se precisar de ajuda humana, procure o responsavel pelo sistema ou o suporte informado pela equipe do AgendaCar."
        ),
    },
    "recomendacao": {
        "keywords": {
            "recomenda": 4, "recomendacao": 4, "indica": 4, "sugerir": 4,
            "qual escolher": 4, "melhor carro": 4, "familia": 2, "viagem": 2,
            "luxo": 2, "esportivo": 2, "economico": 2, "barato": 2,
            "pessoas": 2, "passageiros": 2, "lugares": 2, "orcamento": 2,
            "ate": 1,
        },
    },
    "carros": {
        "keywords": {
            "carros": 3, "carro": 2, "modelos": 3, "disponiveis": 3,
            "disponivel": 3, "frota": 3, "suv": 2, "sedan": 2, "picape": 2,
            "esportivo": 2, "automatico": 2, "manual": 2,
        },
    },
    "filtros": {
        "keywords": {
            "filtro": 4, "filtrar": 4, "ordenar": 4, "buscar": 3, "pesquisar": 3,
            "menor preco": 4, "maior preco": 4, "por tipo": 3, "capacidade": 3,
        },
        "response": (
            "Na tela inicial, use busca, tipo, disponibilidade e ordenacao. "
            "Assim voce encontra carros por modelo, categoria, diaria ou capacidade."
        ),
    },
    "saudacao": {
        "keywords": {
            "oi": 2, "ola": 2, "bom dia": 3, "boa tarde": 3, "boa noite": 3,
            "ajuda": 2, "menu": 2,
        },
        "response": (
            "Oi! Posso ajudar com carros, reservas, pagamento, login, cancelamento, recomendacoes e area admin. "
            "Sobre qual assunto voce quer falar?"
        ),
    },
    "agradecimento": {
        "keywords": {"obrigado": 3, "obrigada": 3, "valeu": 3, "vlw": 3, "show": 2},
        "response": "De nada! Quando quiser consultar carros ou tirar duvida sobre reserva, pode chamar.",
    },
    "despedida": {
        "keywords": {"tchau": 3, "ate": 2, "falou": 2, "sair": 2, "encerrar": 3},
        "response": "Ate mais! Quando quiser consultar ou reservar um carro, estou por aqui.",
    },
}

OFF_SCOPE_TERMS = {
    "piada", "poesia", "musica", "receita", "futebol", "dolar", "clima",
    "tempo", "filme", "noticia", "jogo", "politica", "cagar", "merda",
    "bosta", "porra", "caralho", "fodase",
}

CAR_TYPES = {
    "suv": ["suv", "familia", "viagem", "espacoso"],
    "sedan": ["sedan", "executivo", "confortavel"],
    "sport": ["sport", "esportivo", "performance", "rapido", "luxo"],
    "picape": ["picape", "pickup", "caminhonete", "carga"],
}


def normalizar_texto(texto):
    texto = str(texto or "").strip().lower()
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(char for char in texto if unicodedata.category(char) != "Mn")
    texto = texto.replace("ç", "c")
    texto = re.sub(r"https?://\S+|www\.\S+", " link ", texto)
    texto = re.sub(r"[^a-z0-9@\s]", " ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()

    palavras = [COMMON_TYPOS.get(palavra, palavra) for palavra in texto.split()]
    return " ".join(palavras)


def extrair_mensagem(body):
    try:
        payload = json.loads(body.decode("utf-8") or "{}")
        sender = payload.get("sender") or "usuario"
        message = payload.get("message") or payload.get("mensagem") or ""
        return sender, normalizar_texto(message)
    except Exception:
        return "usuario", ""


def contem_termo(mensagem, termo):
    termo = normalizar_texto(termo)

    if not termo:
        return False

    if " " in termo:
        return termo in mensagem

    return re.search(rf"\b{re.escape(termo)}\b", mensagem) is not None


def pontuar_intencoes(mensagem):
    scores = {}

    for intent, config in INTENTS.items():
        score = 0
        hits = 0

        for termo, peso in config["keywords"].items():
            if contem_termo(mensagem, termo):
                score += peso
                hits += 1

        if hits:
            scores[intent] = {"score": score, "hits": hits}

    return scores


def detectar_intencao(mensagem):
    if contem_termo(mensagem, "reservar") and contem_termo(mensagem, "cancelar"):
        return "ambigua:reservar:cancelar", {}

    scores = pontuar_intencoes(mensagem)

    if not scores:
        return None, scores

    ordenados = sorted(scores.items(), key=lambda item: item[1]["score"], reverse=True)
    melhor_intent, melhor = ordenados[0]

    intents_curtas = {"saudacao", "despedida", "agradecimento"}

    if melhor["score"] < 3 and melhor_intent not in intents_curtas:
        return None, scores

    if melhor["score"] == 3 and melhor["hits"] == 1 and len(mensagem.split()) > 3:
        return None, scores

    if len(ordenados) > 1:
        segundo_intent, segundo = ordenados[1]
        if segundo["score"] >= 3 and melhor["score"] - segundo["score"] <= 1:
            return f"ambigua:{melhor_intent}:{segundo_intent}", scores

    return melhor_intent, scores


def resposta_ambigua(intent_a, intent_b):
    nomes = {
        "reservar": "fazer uma reserva",
        "cancelar": "cancelar uma reserva",
        "alterar": "alterar uma reserva",
        "pagamento": "pagamento ou diaria",
        "login": "login ou cadastro",
        "carros": "consultar carros",
        "recomendacao": "receber uma recomendacao",
        "admin": "area administrativa",
    }

    return (
        f"Fiquei em duvida se voce quer {nomes.get(intent_a, intent_a)} ou "
        f"{nomes.get(intent_b, intent_b)}. Pode confirmar em uma frase curta?"
    )


def resposta_fallback(mensagem):
    if not mensagem:
        return (
            "Nao recebi nenhuma mensagem. Pergunte, por exemplo: 'como reservar?', "
            "'quais carros estao disponiveis?' ou 'como cancelar uma reserva?'."
        )

    if len(mensagem) <= 2:
        return (
            "Sua mensagem ficou muito curta. Pode reformular dizendo se precisa de ajuda com "
            f"{ESCOPO}?"
        )

    if re.fullmatch(r"[\d\s]+", mensagem):
        return (
            "Recebi apenas numeros. Se for sobre diaria, preco ou reserva, escreva tambem o que deseja consultar."
        )

    if "@" in mensagem:
        return (
            "Parece que voce digitou um email. Use a tela de login ou cadastro do AgendaCar. "
            "Por seguranca, nao envie senha pelo chat."
        )

    if any(contem_termo(mensagem, termo) for termo in OFF_SCOPE_TERMS):
        return f"Essa pergunta foge do AgendaCar. Posso ajudar apenas com {ESCOPO}."

    return (
        "Nao tenho certeza do que voce quis dizer. Pode reformular? "
        f"Eu ajudo com {ESCOPO}."
    )


def buscar_carros_api():
    if not API_BASE_URL:
        return None

    url = urljoin(API_BASE_URL.rstrip("/") + "/", "carros")
    request = Request(url, headers={"Accept": "application/json"})

    try:
        with urlopen(request, timeout=API_TIMEOUT_SECONDS) as response:
            if response.status >= 400:
                return None

            payload = json.loads(response.read().decode("utf-8"))
            return payload if isinstance(payload, list) else None
    except Exception:
        return None


def formatar_moeda(valor):
    try:
        numero = float(valor)
    except (TypeError, ValueError):
        return "valor nao informado"

    return f"R$ {numero:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def extrair_preco_maximo(mensagem):
    padroes = [
        r"ate\s*r?\$?\s*(\d{2,6})",
        r"maximo\s*r?\$?\s*(\d{2,6})",
        r"orcamento\s*r?\$?\s*(\d{2,6})",
        r"r\$\s*(\d{2,6})",
        r"(\d{2,6})\s*reais",
    ]

    for padrao in padroes:
        match = re.search(padrao, mensagem)
        if match:
            return int(match.group(1))

    return None


def extrair_passageiros(mensagem):
    match = re.search(r"(\d+)\s*(pessoas|passageiros|lugares)", mensagem)
    if match:
        return int(match.group(1))

    if contem_termo(mensagem, "familia"):
        return 5

    return None


def extrair_tipo(mensagem):
    for tipo, termos in CAR_TYPES.items():
        if any(contem_termo(mensagem, termo) for termo in termos):
            return tipo

    return None


def filtrar_carros(carros, mensagem):
    passageiros = extrair_passageiros(mensagem)
    preco_maximo = extrair_preco_maximo(mensagem)
    tipo = extrair_tipo(mensagem)
    disponiveis = contem_termo(mensagem, "disponivel") or contem_termo(mensagem, "reservar")

    filtrados = list(carros)

    if passageiros:
        filtrados = [c for c in filtrados if int(c.get("capacidade") or 0) >= passageiros]

    if preco_maximo:
        filtrados = [c for c in filtrados if float(c.get("precoDia") or 0) <= preco_maximo]

    if tipo:
        filtrados = [
            c for c in filtrados
            if tipo in normalizar_texto(c.get("tipo", "")) or any(
                termo in normalizar_texto(c.get("nome", "")) for termo in CAR_TYPES[tipo]
            )
        ]

    if disponiveis:
        filtrados = [c for c in filtrados if bool(c.get("disponivel"))]

    return sorted(filtrados, key=lambda c: float(c.get("precoDia") or 0))


def responder_carros(mensagem, recomendacao=False):
    carros = buscar_carros_api()
    passageiros = extrair_passageiros(mensagem)
    preco_maximo = extrair_preco_maximo(mensagem)
    tipo = extrair_tipo(mensagem)

    if recomendacao and not any([passageiros, preco_maximo, tipo]):
        return (
            "Para recomendar melhor, me diga pelo menos um criterio: quantidade de passageiros, "
            "orcamento por diaria ou tipo de uso, como familia, viagem, luxo, esportivo ou economico."
        )

    if carros is None:
        if recomendacao:
            criterios = []
            if passageiros:
                criterios.append(f"{passageiros} passageiros")
            if preco_maximo:
                criterios.append(f"diaria ate {formatar_moeda(preco_maximo)}")
            if tipo:
                criterios.append(f"perfil {tipo}")

            if criterios:
                return (
                    "Nao estou consultando a frota em tempo real agora, entao nao posso garantir disponibilidade. "
                    f"Pelos criterios informados ({', '.join(criterios)}), procure na tela inicial por carros que combinem "
                    "com esse perfil e confira o card antes de reservar."
                )

            return (
                "Consigo orientar a escolha, mas nao estou consultando a frota em tempo real agora. "
                "Informe passageiros, orcamento e tipo de uso para eu sugerir o perfil ideal."
            )

        return (
            "Consulte os cards na tela inicial. Cada card mostra modelo, diaria, capacidade, transmissao "
            "e disponibilidade. Para reservar, clique no carro desejado e informe o periodo."
        )

    filtrados = filtrar_carros(carros, mensagem)

    if not filtrados:
        return (
            "Nao encontrei carro na frota atual com esses criterios. Tente aumentar o orcamento, "
            "mudar o tipo de carro ou consultar todos os modelos na tela inicial."
        )

    selecionados = filtrados[:3]
    linhas = []

    for carro in selecionados:
        status = "disponivel" if carro.get("disponivel") else "indisponivel"
        linhas.append(
            f"{carro.get('nome')} ({carro.get('tipo')}) - {formatar_moeda(carro.get('precoDia'))}/dia, "
            f"{carro.get('capacidade')} lugares, {status}"
        )

    prefixo = "Com base nos criterios, encontrei:" if recomendacao else "Encontrei na frota:"
    return (
        prefixo + "\n- " + "\n- ".join(linhas) +
        "\nAbra o card do carro para conferir detalhes antes de reservar."
    )


def gerar_texto_resposta(mensagem):
    intent, _scores = detectar_intencao(mensagem)

    if intent and intent.startswith("ambigua:"):
        _, intent_a, intent_b = intent.split(":")
        return resposta_ambigua(intent_a, intent_b)

    if intent == "recomendacao":
        return responder_carros(mensagem, recomendacao=True)

    if intent == "carros":
        return responder_carros(mensagem, recomendacao=False)

    if intent:
        return INTENTS[intent]["response"]

    return resposta_fallback(mensagem)


def gerar_resposta(body):
    sender, mensagem = extrair_mensagem(body)
    texto = gerar_texto_resposta(mensagem)

    return [
        {
            "recipient_id": sender,
            "text": texto
        }
    ]


class ChatbotHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, data):
        response = json.dumps(data, ensure_ascii=False).encode("utf-8")

        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.end_headers()

    def do_GET(self):
        if self.path in ["/", "/health"]:
            self._send_json(200, {
                "status": "ok",
                "message": "AgendaCar chatbot funcionando",
                "modo": "proxy"
            })
            return

        self._send_json(404, {
            "erro": "Rota nao encontrada."
        })

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length)

        self._send_json(200, gerar_resposta(body))

    def log_message(self, format, *args):
        print(f"[chatbot] {self.address_string()} - {format % args}", flush=True)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PUBLIC_PORT), ChatbotHandler)

    print(f"Chatbot HTTP aberto em 0.0.0.0:{PUBLIC_PORT}", flush=True)
    print("Servico pronto para receber mensagens.", flush=True)

    server.serve_forever()
