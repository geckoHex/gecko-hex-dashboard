# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables from .env file (api keys in this case)
load_dotenv()

app = Flask(__name__)

# Enable CORS for frontend (running on port 3000)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "X-API-Key"]
    }
})

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

# Route to get a random number
@app.route('/random-number')
def random_number():
    auth = check_api_key()
    if auth:
        return auth
    import random
    number = random.randint(1, 100)
    return jsonify({"number": number}), 200

# Route to add two numbers
@app.route('/add-numbers', methods=['POST'])
def add_numbers():
    auth = check_api_key()
    if auth:
        return auth
    
    data = request.get_json()
    
    # Validate input
    if not data or 'num1' not in data or 'num2' not in data:
        return jsonify({"error": "Missing required parameters: num1 and num2"}), 400
    
    try:
        num1 = int(data['num1'])
        num2 = int(data['num2'])
        result = num1 + num2
        return jsonify({"num1": num1, "num2": num2, "result": result}), 200
    except ValueError:
        return jsonify({"error": "num1 and num2 must be valid integers"}), 400

if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0", port=5000)
