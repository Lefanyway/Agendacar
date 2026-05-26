FROM rasa/rasa:3.6.21-full

WORKDIR /app

COPY chatbot-rasa/ /app/

USER root

ENV RASA_TELEMETRY_ENABLED=false
ENV PORT=10000
ENV RASA_INTERNAL_PORT=5005

RUN rasa train --config config.yml --domain domain.yml --data data

EXPOSE 10000

ENTRYPOINT []

CMD ["python", "render_proxy.py"]