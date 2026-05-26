import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


PUBLIC_PORT = int(os.environ.get("PORT", "10000"))


def extrair_mensagem(body):
    try:
        payload = json.loads(body.decode("utf-8") or "{}")
        sender = payload.get("sender") or "usuario"
        message = payload.get("message") or payload.get("mensagem") or ""
        return sender, message.lower()
    except Exception:
        return "usuario", ""


def gerar_resposta(body):
    sender, mensagem = extrair_mensagem(body)

    if any(palavra in mensagem for palavra in ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "ajuda"]):
        texto = "Olá! Sou o assistente do AgendaCar. Posso ajudar com carros, reservas, pagamento, login e área administrativa."

    elif any(palavra in mensagem for palavra in ["reservar", "reserva", "alugar", "agendar"]):
        texto = "Para reservar, escolha um carro disponível, acesse os detalhes do veículo, informe as datas e confirme a reserva."

    elif any(palavra in mensagem for palavra in ["cancelar", "cancelamento"]):
        texto = "Para cancelar uma reserva, acesse a área de reservas do usuário e clique na opção de cancelamento."

    elif any(palavra in mensagem for palavra in ["pagamento", "pagar", "cartão", "cartao", "pix", "valor"]):
        texto = "O pagamento é feito após escolher o carro e confirmar o período da reserva. Antes de finalizar, confira o veículo, as datas e o valor total."

    elif any(palavra in mensagem for palavra in ["login", "entrar", "cadastro", "cadastrar", "senha"]):
        texto = "Você pode criar uma conta ou entrar com e-mail e senha pela tela de login. Para acessar reservas, é necessário estar autenticado."

    elif any(palavra in mensagem for palavra in ["admin", "administrador", "painel", "gerenciar"]):
        texto = "A área administrativa permite cadastrar, editar e remover carros. O acesso é restrito a usuários administradores."

    elif any(palavra in mensagem for palavra in ["carro", "carros", "veículo", "veiculos", "modelo", "disponível", "disponiveis"]):
        texto = "Você pode consultar os carros na tela inicial. A lista mostra modelo, preço, capacidade, transmissão e disponibilidade."

    elif any(palavra in mensagem for palavra in ["filtro", "filtrar", "ordenar", "preço", "preco"]):
        texto = "Use os filtros e a ordenação para buscar carros por tipo, preço, disponibilidade ou capacidade."

    elif any(palavra in mensagem for palavra in ["recomendação", "recomendacao", "recomendar", "indicar"]):
        texto = "A recomendação considera orçamento, quantidade de passageiros e tipo de viagem para sugerir uma opção adequada."

    elif any(palavra in mensagem for palavra in ["obrigado", "obrigada", "valeu", "vlw", "show"]):
        texto = "De nada! Quando precisar, é só chamar."

    elif any(palavra in mensagem for palavra in ["tchau", "sair", "até", "ate"]):
        texto = "Até mais! Volte quando quiser consultar ou reservar um carro."

    else:
        texto = "Não entendi totalmente. Posso ajudar com reserva, carros disponíveis, pagamento, login, cadastro ou área administrativa."

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
            "erro": "Rota não encontrada."
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
    print("Serviço pronto para receber mensagens.", flush=True)

    server.serve_forever()