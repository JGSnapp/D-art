FROM python:3.9-slim

RUN mkdir /app
WORKDIR /app

RUN pip install pyTelegramBotAPI

COPY . /app

CMD ["python", "bot.py"]