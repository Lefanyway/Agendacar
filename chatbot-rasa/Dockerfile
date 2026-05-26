FROM python:3.11-slim

WORKDIR /app

COPY chatbot-rasa/render_proxy.py /app/render_proxy.py

ENV PORT=10000

EXPOSE 10000

CMD ["python", "render_proxy.py"]