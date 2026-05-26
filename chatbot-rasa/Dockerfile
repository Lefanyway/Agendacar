FROM rasa/rasa:3.6.21-full

WORKDIR /app

COPY chatbot-rasa/ /app/

USER root

ENV RASA_TELEMETRY_ENABLED=false
ENV PORT=10000

RUN rasa train --config config.yml --domain domain.yml --data data

EXPOSE 10000

ENTRYPOINT []

CMD ["rasa", "run", "--enable-api", "--cors", "*", "-i", "0.0.0.0", "-p", "10000"]