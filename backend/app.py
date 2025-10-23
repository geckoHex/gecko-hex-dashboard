# app.py
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv

# 👇 Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# 🔑 Grab API key from .env
API_KEY = os.getenv("FLASK_API_KEY")

def check_api_key():
    """Check for valid API key in request headers."""
    key = request.headers.get("X-API-Key")
    if key != API_KEY:
        return jsonify({"error": "Unauthorized"}), 401
    return None

@app.route('/test-auth')
def test_auth():
    auth = check_api_key()
    if auth:
        return auth
    return "Nothing beats a Jet 2 Skibidi Holiday"

if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0", port=5000)
