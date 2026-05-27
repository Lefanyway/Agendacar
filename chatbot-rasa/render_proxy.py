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
MIN_CONFIDENCE = 0.62
AMBIGUITY_DELTA = 0.08

INTENT_AREA_ADMIN = "area_admin"
INTENT_CANCELAR_RESERVA = "cancelar_reserva"
INTENT_ALTERAR_RESERVA = "alterar_reserva"
INTENT_MINHAS_RESERVAS = "minhas_reservas"
INTENT_PAGAMENTO = "pagamento"
INTENT_PROBLEMA_LOGIN = "problema_login"
INTENT_LOGIN_CADASTRO = "login_cadastro"
INTENT_SUPORTE_HUMANO = "suporte_humano"
INTENT_RESERVAR_CARRO = "reservar_carro"
INTENT_CONSULTAR_CARROS = "consultar_carros"
INTENT_CONSULTAR_MODELO = "consultar_modelo"
INTENT_FILTROS_CARROS = "filtros_carros"
INTENT_RECOMENDACAO_CARRO = "recomendacao_carro"
INTENT_SAUDACAO = "saudacao"
INTENT_AGRADECIMENTO = "agradecimento"
INTENT_DESPEDIDA = "despedida"
INTENT_FORA_ESCOPO = "fora_escopo"
INTENT_FALLBACK = "fallback"
INTENT_ERRO = "erro"

INTENT_PRIORITY = {
    INTENT_AREA_ADMIN: 1,
    INTENT_CANCELAR_RESERVA: 2,
    INTENT_ALTERAR_RESERVA: 3,
    INTENT_MINHAS_RESERVAS: 4,
    INTENT_PAGAMENTO: 5,
    INTENT_PROBLEMA_LOGIN: 6,
    INTENT_LOGIN_CADASTRO: 7,
    INTENT_SUPORTE_HUMANO: 8,
    INTENT_RESERVAR_CARRO: 9,
    INTENT_CONSULTAR_CARROS: 10,
    INTENT_CONSULTAR_MODELO: 11,
    INTENT_FILTROS_CARROS: 12,
    INTENT_RECOMENDACAO_CARRO: 13,
    INTENT_SAUDACAO: 14,
    INTENT_AGRADECIMENTO: 15,
    INTENT_DESPEDIDA: 16,
    INTENT_FORA_ESCOPO: 17,
    INTENT_FALLBACK: 18,
}

INTENTS_COM_CARDS = {
    INTENT_RESERVAR_CARRO,
    INTENT_CONSULTAR_CARROS,
    INTENT_CONSULTAR_MODELO,
    INTENT_FILTROS_CARROS,
    INTENT_RECOMENDACAO_CARRO,
}

TERMOS_GENERICOS = {"reserva", "reservas", "carro", "carros", "pagamento", "ajuda"}

RESPOSTAS = {
    INTENT_SAUDACAO: "Ola! Posso ajudar com carros, reservas, pagamento, login, cancelamento e suporte. Sobre qual assunto voce quer falar?",
    INTENT_AGRADECIMENTO: "De nada! Quando quiser consultar carros ou tirar duvida sobre reserva, pode chamar.",
    INTENT_DESPEDIDA: "Ate mais! Quando quiser consultar ou reservar um carro, estou por aqui.",
    INTENT_CONSULTAR_CARROS: "Encontrei os carros disponiveis no sistema. Confira os cards abaixo.",
    INTENT_RESERVAR_CARRO: "Claro. Escolha um carro disponivel nos cards abaixo. Depois informe o periodo da reserva e confirme pelo sistema.",
    INTENT_CONSULTAR_MODELO: "Use a busca da tela inicial para procurar o modelo. O card mostra diaria, capacidade, transmissao e disponibilidade antes da reserva.",
    INTENT_FILTROS_CARROS: "Use busca, tipo, disponibilidade e ordenacao na tela inicial para encontrar carros por modelo, categoria, diaria ou capacidade.",
    INTENT_RECOMENDACAO_CARRO: "Para recomendar melhor, me diga quantidade de passageiros, orcamento por diaria e tipo de uso, como familia, viagem, luxo, esportivo ou economico.",
    INTENT_MINHAS_RESERVAS: "Voce pode consultar suas reservas acessando Minhas Reservas apos fazer login.",
    INTENT_CANCELAR_RESERVA: "Entendi que voce quer cancelar uma reserva. Eu nao cancelo automaticamente pelo chat. Acesse Minhas Reservas, escolha a reserva desejada e use a opcao de cancelamento.",
    INTENT_ALTERAR_RESERVA: "Para alterar uma reserva, acesse Minhas Reservas e selecione a reserva desejada. Se o sistema nao permitir edicao direta, cancele e faca uma nova reserva com os dados corretos.",
    INTENT_PAGAMENTO: "O pagamento deve ser feito na etapa de finalizacao da reserva. Confira as opcoes disponiveis diretamente na tela de pagamento.",
    INTENT_LOGIN_CADASTRO: "Use a tela de login para entrar com email e senha. Se ainda nao tiver conta, faca o cadastro antes de reservar.",
    INTENT_PROBLEMA_LOGIN: "Confira email e senha digitados. Se o problema continuar, procure suporte. Por seguranca, nao envie senha pelo chat.",
    INTENT_AREA_ADMIN: "A area administrativa e restrita a usuarios com permissao de administrador. O chat nao concede acesso nem altera permissoes.",
    INTENT_SUPORTE_HUMANO: "Se precisar de ajuda humana, procure o suporte informado pela equipe do AgendaCar.",
    INTENT_FORA_ESCOPO: "Consigo ajudar apenas com assuntos do AgendaCar, como carros, reservas, pagamento, login, cancelamento e suporte.",
    INTENT_FALLBACK: "Nao consegui entender com seguranca. Voce quer reservar um carro, consultar suas reservas, cancelar uma reserva ou falar sobre pagamento?",
    INTENT_ERRO: "Tive um problema ao processar sua mensagem. Pode tentar digitar de novo?",
}

PALAVRAS_COMUNS = {
    "resarvar": "reservar",
    "resrvar": "reservar",
    "qro": "quero",
    "q": "que",
    "vc": "voce",
    "vcs": "voces",
    "veiculo": "carro",
    "veiculos": "carros",
    "locacao": "reserva",
    "locacoes": "reservas",
    "pagamnto": "pagamento",
    "pagmanto": "pagamento",
    "loguin": "login",
    "adimin": "admin",
    "admim": "admin",
}

INTENT_RULES = {
    INTENT_CANCELAR_RESERVA: {
        "phrases": {
            "cancelar minha reserva": 10,
            "cancelar reserva": 9,
            "como cancelo uma reserva": 9,
            "como cancelar uma reserva": 9,
            "desmarcar reserva": 8,
            "remover reserva": 8,
            "desistir da reserva": 8,
        },
        "words": {"cancelar": 4, "cancelo": 4, "desmarcar": 4, "remover": 3, "desistir": 3, "reserva": 2, "reservas": 2},
        "requires_any": [{"cancelar", "cancelo", "desmarcar", "remover", "desistir"}],
    },
    INTENT_ALTERAR_RESERVA: {
        "phrases": {
            "alterar minha reserva": 10,
            "alterar reserva": 9,
            "mudar a data da reserva": 10,
            "mudar data da reserva": 9,
            "trocar data da reserva": 9,
            "remarcar reserva": 9,
            "editar reserva": 8,
        },
        "words": {"alterar": 4, "mudar": 4, "trocar": 4, "remarcar": 4, "editar": 4, "modificar": 4, "data": 2, "reserva": 2},
        "requires_any": [{"alterar", "mudar", "trocar", "remarcar", "editar", "modificar"}],
    },
    INTENT_MINHAS_RESERVAS: {
        "phrases": {
            "onde vejo minhas reservas": 10,
            "minhas reservas": 9,
            "ver minhas reservas": 9,
            "consultar minhas reservas": 9,
            "quero ver minha reserva": 9,
            "onde esta minha reserva": 9,
            "historico de reservas": 8,
            "reservas feitas": 8,
            "minhas locacoes": 8,
            "meus agendamentos": 8,
        },
        "words": {"minhas": 4, "meus": 3, "ver": 3, "vejo": 3, "consultar": 3, "historico": 4, "reservas": 3, "reserva": 2, "agendamentos": 4},
        "requires_any": [{"minhas", "meus", "vejo", "ver", "consultar", "historico", "agendamentos"}],
    },
    INTENT_PAGAMENTO: {
        "phrases": {"quero pagar minha reserva": 10, "confirmar pagamento": 8, "confirma meu pagamento": 8, "pagamento da reserva": 8, "forma de pagamento": 7},
        "words": {"pagar": 4, "pagamento": 4, "pix": 4, "cartao": 4, "boleto": 4, "comprovante": 4, "confirmar": 3, "confirma": 3},
    },
    INTENT_PROBLEMA_LOGIN: {
        "phrases": {"esqueci minha senha": 10, "nao consigo entrar": 9, "login nao funciona": 9, "erro no login": 8, "senha errada": 8},
        "words": {"esqueci": 4, "senha": 4, "erro": 3, "login": 3, "entrar": 2, "bloqueado": 3},
    },
    INTENT_LOGIN_CADASTRO: {
        "phrases": {"criar conta": 8, "fazer cadastro": 8, "como faco login": 8, "entrar na conta": 7},
        "words": {"login": 3, "cadastro": 3, "cadastrar": 3, "conta": 2, "entrar": 2, "logar": 3},
    },
    INTENT_AREA_ADMIN: {
        "phrases": {"sou admin": 9, "area admin": 8, "area administrativa": 8, "cadastrar carro": 8, "painel administrativo": 8},
        "words": {"admin": 4, "administrador": 4, "administrativa": 4, "painel": 3, "cadastrar": 3, "editar": 3, "remover": 3},
    },
    INTENT_SUPORTE_HUMANO: {
        "phrases": {"suporte humano": 8, "falar com atendente": 8, "falar com alguem": 7},
        "words": {"suporte": 4, "atendente": 4, "humano": 4, "alguem": 3, "ajuda": 1},
    },
    INTENT_RESERVAR_CARRO: {
        "phrases": {"quero reservar um carro": 10, "quero alugar um carro": 10, "reservar carro": 8, "alugar carro": 8, "locar carro": 8, "fazer uma reserva": 6},
        "words": {"reservar": 4, "alugar": 4, "locar": 4, "agendar": 3, "carro": 3, "veiculo": 3},
        "requires_any": [{"reservar", "alugar", "locar", "agendar"}],
    },
    INTENT_CONSULTAR_CARROS: {
        "phrases": {"me mostra todos os carros": 10, "mostrar carros": 9, "mostre os carros": 9, "me mostra os carros": 9, "quais carros voces tem": 9, "ver carros": 8, "listar carros": 8, "lista de carros": 8, "carros disponiveis": 8, "modelos disponiveis": 8, "todos os carros": 8, "quero ver os carros": 8},
        "words": {"mostrar": 4, "mostra": 4, "mostre": 4, "listar": 4, "liste": 4, "quais": 3, "todos": 3, "carros": 3, "modelos": 3, "disponiveis": 3, "automatico": 2},
        "requires_any": [{"mostrar", "mostra", "mostre", "listar", "liste", "quais", "todos", "disponiveis", "modelos", "automatico"}],
    },
    INTENT_FILTROS_CARROS: {
        "phrases": {"filtrar carros": 8, "ordenar por menor preco": 8, "buscar por modelo": 7},
        "words": {"filtro": 4, "filtrar": 4, "ordenar": 4, "buscar": 3, "preco": 2, "capacidade": 2},
    },
    INTENT_RECOMENDACAO_CARRO: {
        "phrases": {"me recomenda um carro": 9, "qual carro voce recomenda": 9, "melhor carro para viagem": 8, "carro para familia": 7},
        "words": {"recomenda": 4, "recomendacao": 4, "indica": 4, "sugere": 4, "familia": 2, "viagem": 2, "luxo": 2, "esportivo": 2, "economico": 2, "passageiros": 2},
    },
    INTENT_SAUDACAO: {"phrases": {"bom dia": 5, "boa tarde": 5, "boa noite": 5}, "words": {"oi": 4, "ola": 4, "opa": 3, "salve": 3}},
    INTENT_AGRADECIMENTO: {"phrases": {}, "words": {"obrigado": 4, "obrigada": 4, "valeu": 4, "vlw": 3}},
    INTENT_DESPEDIDA: {"phrases": {"ate mais": 5, "ate logo": 5}, "words": {"tchau": 4, "falou": 3, "sair": 3, "encerrar": 3}},
}

OFF_SCOPE_TERMS = {"capital", "franca", "piada", "poesia", "receita", "futebol", "dolar", "clima", "filme", "noticia", "politica"}


def normalizar_texto(texto):
    texto = str(texto or "").strip().lower()
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(char for char in texto if unicodedata.category(char) != "Mn")
    texto = re.sub(r"https?://\S+|www\.\S+", " link ", texto)
    texto = re.sub(r"[^a-z0-9@\s]", " ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()
    return " ".join(PALAVRAS_COMUNS.get(palavra, palavra) for palavra in texto.split())


def contem_termo(texto, termo):
    termo = normalizar_texto(termo)
    if not termo:
        return False
    if " " in termo:
        return termo in texto
    return re.search(rf"\b{re.escape(termo)}\b", texto) is not None


def calcular_pontuacao(texto, config):
    score = 0
    hits = 0

    for frase, peso in config.get("phrases", {}).items():
        if contem_termo(texto, frase):
            score += peso
            hits += 1

    for palavra, peso in config.get("words", {}).items():
        if contem_termo(texto, palavra):
            score += peso
            hits += 1

    required_groups = config.get("requires_any") or []
    if required_groups and not any(any(contem_termo(texto, item) for item in group) for group in required_groups):
        return 0, 0

    return score, hits


def calcular_confianca(score, hits):
    if score <= 0:
        return 0.0
    base = min(0.95, score / 15)
    bonus = min(0.12, hits * 0.025)
    return round(min(0.96, base + bonus), 2)


def resolver_ambiguidade(candidatos):
    if len(candidatos) < 2:
        return None

    primeiro = candidatos[0]
    segundo = candidatos[1]
    if primeiro["confidence"] < MIN_CONFIDENCE:
        return INTENT_FALLBACK
    if primeiro["confidence"] - segundo["confidence"] <= AMBIGUITY_DELTA:
        return INTENT_FALLBACK
    return None


def detectar_intencao(texto):
    if not texto or re.fullmatch(r"[\W_]*", texto):
        return INTENT_FALLBACK, 0.0

    if texto in TERMOS_GENERICOS:
        return INTENT_FALLBACK, 0.42

    if any(contem_termo(texto, termo) for termo in OFF_SCOPE_TERMS):
        return INTENT_FORA_ESCOPO, 0.9

    candidatos = []
    for intent, config in INTENT_RULES.items():
        score, hits = calcular_pontuacao(texto, config)
        confidence = calcular_confianca(score, hits)
        if score > 0:
            candidatos.append({
                "intent": intent,
                "score": score,
                "hits": hits,
                "confidence": confidence,
                "priority": INTENT_PRIORITY.get(intent, 99),
            })

    if not candidatos:
        return INTENT_FALLBACK, 0.0

    candidatos.sort(key=lambda item: (-item["confidence"], -item["score"], item["priority"]))
    ambigua = resolver_ambiguidade(candidatos)
    if ambigua:
        return ambigua, candidatos[0]["confidence"]

    escolhido = candidatos[0]
    if escolhido["confidence"] < MIN_CONFIDENCE:
        return INTENT_FALLBACK, escolhido["confidence"]

    return escolhido["intent"], escolhido["confidence"]


def extrair_payload(body):
    try:
        payload = json.loads(body.decode("utf-8") or "{}")
    except Exception:
        return "usuario", ""

    sender = payload.get("sender") or payload.get("recipient_id") or "usuario"
    message = payload.get("message") or payload.get("mensagem") or ""
    return sender, normalizar_texto(message)


def buscar_cards_carros():
    if not API_BASE_URL:
        return []

    url = urljoin(API_BASE_URL.rstrip("/") + "/", "carros")
    request = Request(url, headers={"Accept": "application/json"})

    try:
        with urlopen(request, timeout=API_TIMEOUT_SECONDS) as response:
            if response.status >= 400:
                return []
            payload = json.loads(response.read().decode("utf-8"))
    except Exception:
        return []

    carros = payload if isinstance(payload, list) else payload.get("data", []) if isinstance(payload, dict) else []
    cards = []
    for carro in carros:
        if not isinstance(carro, dict):
            continue
        cards.append({
            "id": carro.get("id"),
            "nome": carro.get("nome") or carro.get("modelo") or "Carro",
            "tipo": carro.get("tipo") or carro.get("categoria") or "",
            "imagem": carro.get("imagem"),
            "capacidade": carro.get("capacidade"),
            "transmissao": carro.get("transmissao"),
            "tanque": carro.get("tanque"),
            "precoDia": carro.get("precoDia") or carro.get("preco_diaria") or carro.get("diaria"),
            "disponivel": bool(carro.get("disponivel", True)),
        })
    return cards


def resposta_fallback(confidence=0.0):
    return montar_resposta(INTENT_FALLBACK, confidence, [])


def resposta_erro():
    return montar_resposta(INTENT_ERRO, 0.0, [], error=True)


def montar_resposta(intent, confidence, cards=None, error=False):
    cards = cards or []
    show_cards = intent in INTENTS_COM_CARDS and len(cards) > 0
    resposta = RESPOSTAS.get(intent, RESPOSTAS[INTENT_FALLBACK])

    if intent == INTENT_CONSULTAR_CARROS and show_cards:
        resposta = f"Encontrei {len(cards)} carro(s) para voce. Confira os cards abaixo."

    return {
        "resposta": resposta,
        "intent": intent,
        "confidence": round(float(confidence or 0.0), 2),
        "showCards": show_cards,
        "cards": cards if show_cards else [],
        "error": bool(error),
    }


def processar_chat(body):
    _sender, texto = extrair_payload(body)
    intent, confidence = detectar_intencao(texto)
    cards = buscar_cards_carros() if intent in INTENTS_COM_CARDS else []
    return montar_resposta(intent, confidence, cards)


def adaptar_para_rasa(sender, resposta):
    return [{"recipient_id": sender, "text": resposta.get("resposta", "")}]


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

    def do_OPTIONS(self):
        self._send_json(204, {})

    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/health"):
            self._send_json(200, {"status": "ok", "service": "agendacar-chatbot-proxy"})
            return

        self._send_json(200, {"status": "ok", "message": "AgendaCar chatbot proxy ativo"})

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length) if length else b"{}"
            sender, _texto = extrair_payload(body)
            resposta = processar_chat(body)

            if self.path.startswith("/webhooks/rest/webhook"):
                self._send_json(200, adaptar_para_rasa(sender, resposta))
                return

            self._send_json(200, resposta)
        except Exception:
            self._send_json(500, resposta_erro())

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PUBLIC_PORT), ChatbotHandler)
    print(f"AgendaCar chatbot proxy listening on port {PUBLIC_PORT}", flush=True)
    server.serve_forever()
