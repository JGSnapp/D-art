from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS 

import os
import logging


# Настройка логирования
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app) 

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data['message']
        app.logger.info('Message received: %s', message)
        # Функция для вызова API ChatGPT
        def call_openai(message):
            client = OpenAI(
                api_key="--",
                base_url="https://api.proxyapi.ru/openai/v1",
            )

            response = client.chat.completions.create(
                model="gpt-4", messages=[
                    # Каждый запрос обрабатывается как новый диалог
                    {"role": "system", "content": "Write html code with css styles and js code included in it, which will clearly correspond to the user's request. Apart from the code, do not display a single character, because your message will be completely used and launched."},
                    {"role": "user", "content": message},
                ]
            )
            app.logger.info('Raw response: %s', response)
            return response.choices[0].message.content
        
        # Получаем ответ от ChatGPT
        chat_response = call_openai(message)
        app.logger.info('ChatGPT response: %s', chat_response)
        return jsonify({'response': chat_response})
    except Exception as e:
        app.logger.error('An error occurred: %s', str(e))
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.logger.info('Start')
    app.run(host='0.0.0.0', port=9000)