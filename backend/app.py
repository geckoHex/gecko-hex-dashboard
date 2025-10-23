# app.py
from flask import Flask
import command_layer as CMD

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello, world!'

@app.route('/date')
def date():
    return CMD.get_date()

@app.route('/cal')
def cal():
    return CMD.get_cal()

@app.route('/add/<int:a>/<int:b>')
def add(a, b):
    return CMD.do_add(a, b)

if __name__ == '__main__':
    app.run(debug=True)
