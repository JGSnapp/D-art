FROM python:3.9-slim

RUN mkdir /app
WORKDIR /app

RUN pip install openai
RUN pip install Flask
RUN pip install flask_cors

COPY . /app

CMD ["python", "gpt.py"]