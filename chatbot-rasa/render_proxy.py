import json
import os
import re
import unicodedata
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


PUBLIC_PORT = int(os.environ.get("PORT", "10000"))

INTENT_KEYWORDS = {
    "saudacao": [
        "oi", "ola", "bom dia", "boa tarde", "boa noite", "e ai", "ajuda",
        "menu", "inicio", "comecar"
    ],
    "reserva": [
        "reservar", "reserva", "reservas", "alugar", "aluguel", "agendar",
        "agendamento", "como reservar", "como alugar", "quero reservar",
        "quero alugar", "fazer reserva", "locar", "retirada", "devolucao"
    ],
    "cancelamento": [
        "cancelar", "cancelamento", "desmarcar", "remover reserva",
        "excluir reserva", "cancelar reserva"
    ],
    "pagamento": [
        "pagamento", "pagar", "cartao", "pix", "valor", "preco", "diaria",
        "custo", "parcelar", "parcela", "confirmar pagamento", "cobranca"
    ],
    "login": [
        "login", "entrar", "logar", "cadastro", "cadastrar", "criar conta",
        "senha", "esqueci senha", "minha conta", "acessar"
    ],
    "admin": [
        "admin", "administrador", "painel", "gerenciar", "crud", "cadastrar carro",
        "editar carro", "remover carro", "excluir carro", "frota"
    ],
    "carros": [
        "carro", "carros", "veiculo", "veiculos", "modelo", "modelos",
        "disponivel", "disponiveis", "bmw", "m3", "ferrari", "camaro",
        "audi", "porsche", "fiat", "sw4", "range", "corolla", "civic"
    ],
    "filtros": [
        "filtro", "filtrar", "ordenar", "buscar", "pesquisar", "menor preco",
        "maior preco", "barato", "mais barato", "capacidade", "automatico",
        "manual", "suv", "sport", "picape", "luxo"
    ],
    "recomendacao": [
        "recomendacao", "recomendar", "indicar", "sugerir", "qual escolher",
        "melhor carro", "me indica", "viagem", "familia", "casal", "trabalho"
    ],
    "agradecimento": [
        "obrigado", "obrigada", "valeu", "vlw", "show", "perfeito", "beleza",
        "top", "ajudou"
    ],
    "despedida": [
        "tchau", "sair", "ate", "falou", "encerrar", "finalizar"
    ],
}

RESPONSES = {
    "saudacao": (
        "Oi! Eu sou o assistente do AgendaCar. Posso ajudar com reserva, carros "
        "disponiveis, filtros, pagamento, login, cancelamento e area administrativa. "
        "Me diga o que voce quer fazer."
    ),
    "reserva": (
        "Para reservar, escolha um carro, abra os detalhes, informe data de retirada, "
        "data de devolucao e destino. Depois avance para o pagamento e confirme. "
        "Se quiser, diga o tipo de carro ou faixa de preco que eu te oriento melhor."
    ),
    "cancelamento": (
        "Para cancelar, entre em Minhas Reservas e use a opcao de cancelamento na reserva desejada. "
        "Apenas o usuario dono da reserva pode cancelar, entao confirme se voce esta logado na conta certa."
    ),
    "pagamento": (
        "O pagamento aparece depois da escolha do carro e do periodo da reserva. "
        "Antes de finalizar, confira veiculo, datas, destino e valor total. "
        "Se algum valor parecer errado, volte aos detalhes do carro e refaca o periodo."
    ),
    "login": (
        "Para acessar, use email e senha na tela de login. Se ainda nao tiver conta, crie uma pelo cadastro. "
        "Reservas, pagamento e historico exigem usuario autenticado."
    ),
    "admin": (
        "A area administrativa serve para cadastrar, editar e remover carros da frota. "
        "O acesso e restrito a usuarios com perfil admin; usuarios comuns sao redirecionados para a home."
    ),
    "carros": (
        "Na home voce encontra os carros cadastrados com nome, categoria, capacidade, transmissao, "
        "preco por dia e disponibilidade. Abra um card para ver detalhes e iniciar a reserva."
    ),
    "filtros": (
        "Use busca, tipo, disponibilidade e ordenacao para encontrar o carro ideal. "
        "Exemplos: SUV para familia, esportivo para experiencia premium ou menor preco para economizar."
    ),
    "recomendacao": (
        "Para eu recomendar melhor, me diga quantidade de passageiros, tipo de viagem e limite de diaria. "
        "Exemplo: 'somos 5 pessoas e quero um SUV barato'."
    ),
    "agradecimento": "De nada! Quando quiser comparar carros ou tirar duvida sobre reserva, pode chamar.",
    "despedida": "Ate mais! Quando quiser consultar ou reservar um carro, estou por aqui.",
}


def normalizar_texto(texto):
    texto = str(texto or "").strip().lower()
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(char for char in texto if unicodedata.category(char) != "Mn")
    texto = re.sub(r"https?://\S+|www\.\S+", " link ", texto)
    texto = re.sub(r"[^a-z0-9@\s]", " ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto


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

    if " " in termo:
        return termo in mensagem

    return re.search(rf"\b{re.escape(termo)}\b", mensagem) is not None


def detectar_intencao(mensagem):
    pontuacao = {}

    for intencao, termos in INTENT_KEYWORDS.items():
        pontos = sum(1 for termo in termos if contem_termo(mensagem, termo))
        if pontos:
            pontuacao[intencao] = pontos

    if not pontuacao:
        return None

    prioridade = [
        "cancelamento", "reserva", "pagamento", "login", "admin", "recomendacao",
        "filtros", "carros", "saudacao", "agradecimento", "despedida"
    ]

    return max(pontuacao, key=lambda item: (pontuacao[item], -prioridade.index(item)))


def resposta_fallback(mensagem):
    if not mensagem:
        return (
            "Nao recebi nenhuma mensagem. Voce pode perguntar, por exemplo: "
            "'como reservar?', 'quais carros estao disponiveis?' ou 'como cancelar uma reserva?'."
        )

    if len(mensagem) <= 2:
        return (
            "Recebi uma mensagem muito curta. Me diga com um pouco mais de detalhe se voce quer ajuda "
            "com carros, reserva, pagamento, login ou cancelamento."
        )

    if re.fullmatch(r"[\d\s]+", mensagem):
        return (
            "Recebi apenas numeros. Se for sobre preco, diaria ou reserva, escreva tambem o que voce quer consultar."
        )

    if "@" in mensagem:
        return (
            "Parece que voce digitou um email. Para login ou cadastro, use a tela propria do AgendaCar. "
            "Por seguranca, nao envie senha ou dados sensiveis pelo chat."
        )

    return (
        "Ainda nao entendi essa mensagem dentro do AgendaCar. Posso ajudar com: reservar um carro, "
        "ver carros disponiveis, escolher por preco ou tipo, pagamento, login, cancelamento e area admin. "
        "Tente escrever como uma pergunta, por exemplo: 'como reservar um SUV?'."
    )


def gerar_resposta(body):
    sender, mensagem = extrair_mensagem(body)
    intencao = detectar_intencao(mensagem)
    texto = RESPONSES[intencao] if intencao else resposta_fallback(mensagem)

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
