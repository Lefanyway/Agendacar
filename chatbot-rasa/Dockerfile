FROM rasa/rasa:3.6.21-full

WORKDIR /app

COPY . /app

USER root

RUN rasa train

EXPOSE 5005

CMD ["sh", "-c", "rasa run --enable-api --cors '*' --host 0.0.0.0 --port ${PORT:-5005}"]