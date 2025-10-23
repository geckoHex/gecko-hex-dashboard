# app.py
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv

# Load environment variables from .env file (api keys in this case)
load_dotenv()

app = Flask(__name__)

# Find the api key in .env
API_KEY = os.getenv("FLASK_API_KEY")

# API key checker
def check_api_key():
    """Check for valid API key in request headers."""
    key = request.headers.get("X-API-Key")
    if key != API_KEY:
        return jsonify({"error": "Unauthorized"}), 401
    return None

# Route to test auth
@app.route('/test-auth')
def test_auth():
    auth = check_api_key()
    if auth:
        return auth
    return jsonify({"authenticated": True}), 200

if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0", port=5000)
