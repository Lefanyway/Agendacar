import json
import os
import subprocess
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


PUBLIC_PORT = int(os.environ.get("PORT", "10000"))
RASA_INTERNAL_PORT = int(os.environ.get("RASA_INTERNAL_PORT", "5005"))
RASA_URL = f"http://127.0.0.1:{RASA_INTERNAL_PORT}"


def start_rasa():
    command = [
        "rasa",
        "run",
        "--enable-api",
        "--cors",
        "*",
        "-i",
        "127.0.0.1",
        "-p",
        str(RASA_INTERNAL_PORT),
    ]

    print(f"Iniciando Rasa interno em {RASA_URL}", flush=True)
    subprocess.Popen(command)


def fallback_response(body):
    sender = "usuario"

    try:
        payload = json.loads(body.decode("utf-8") or "{}")
        sender = payload.get("sender") or sender
    except Exception:
        pass

    return [
        {
            "recipient_id": sender,
            "text": "O assistente está inicializando. Tente novamente em alguns segundos."
        }
    ]


class ProxyHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, data):
        response = json.dumps(data).encode("utf-8")

        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self):
        if self.path in ["/", "/health"]:
            self._send_json(200, {
                "status": "ok",
                "message": "AgendaCar Rasa proxy funcionando",
                "rasa_url": RASA_URL
            })
            return

        self._send_json(404, {
            "erro": "Rota não encontrada."
        })

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length)

        target_url = f"{RASA_URL}{self.path}"

        try:
            request = urllib.request.Request(
                target_url,
                data=body,
                headers={
                    "Content-Type": self.headers.get("Content-Type", "application/json")
                },
                method="POST"
            )

            with urllib.request.urlopen(request, timeout=8) as response:
                response_body = response.read()
                response_data = json.loads(response_body.decode("utf-8") or "[]")
                self._send_json(response.status, response_data)

        except urllib.error.URLError as error:
            print(f"Rasa ainda indisponível: {error}", flush=True)
            self._send_json(200, fallback_response(body))

        except Exception as error:
            print(f"Erro no proxy do Rasa: {error}", flush=True)
            self._send_json(200, fallback_response(body))

    def log_message(self, format, *args):
        print(f"[proxy] {self.address_string()} - {format % args}", flush=True)


if __name__ == "__main__":
    threading.Thread(target=start_rasa, daemon=True).start()

    server = ThreadingHTTPServer(("0.0.0.0", PUBLIC_PORT), ProxyHandler)

    print(f"Proxy HTTP aberto em 0.0.0.0:{PUBLIC_PORT}", flush=True)
    print("Render já consegue detectar a porta.", flush=True)

    server.serve_forever()