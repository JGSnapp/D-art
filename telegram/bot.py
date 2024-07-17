from telebot import types
import telebot

bot = telebot.TeleBot('--')

def webAppKeyboard():
   keyboard = types.ReplyKeyboardMarkup(row_width=1)
   webAppTest = types.WebAppInfo("https://d-art.space")
   one_butt = types.KeyboardButton(text="Ну что, в D'art?", web_app=webAppTest)
   keyboard.add(one_butt)

   return keyboard

@bot.message_handler(commands=['start']) 
def start_fun(message):
   bot.send_message( message.chat.id, 'Ты уже на пол пути...', parse_mode="Markdown", reply_markup=webAppKeyboard())

if __name__ == '__main__':
   bot.infinity_polling()