FROM rasa/rasa:3.6.21-full

WORKDIR /app

COPY chatbot-rasa/ /app/

USER root

ENV RASA_TELEMETRY_ENABLED=false

RUN rasa train --config config.yml --domain domain.yml --data data

EXPOSE 5005

ENTRYPOINT []

CMD ["sh", "-c", "rasa run --enable-api --cors '*' --interface 0.0.0.0 --port ${PORT:-5005}"]