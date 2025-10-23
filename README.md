# Gecko Hex Dashboard

A full-stack web application with a Flask REST API backend and vanilla JavaScript frontend. The project provides a secure, credential-based authenticated interface for interacting with backend services.

## Core Functionality

- **Secure Authentication**: Username and password are hashed using SHA-256 to create an API key
- **API Key Protection**: All endpoints are protected with X-API-Key header authentication
- **RESTful API**: Flask-based backend exposing JSON endpoints
- **Modern UI**: Microsoft Fluent UI inspired design with clean, square aesthetic
- **Web Interface**: Responsive UI with login flow and session management
- **CORS Enabled**: Backend configured to communicate with frontend on different ports

## Authentication Flow

1. User enters username and password in the login form
2. Frontend hashes the credentials using SHA-256: `hash(username:password)`
3. The resulting hash is used as the API key for all subsequent requests
4. Backend validates the API key against the configured `FLASK_API_KEY` in `.env`

**Note**: To generate your API key for the `.env` file, hash your desired username:password combination using SHA-256.

**Security Note**: The application uses the Web Crypto API (`crypto.subtle`) when available (HTTPS or localhost). For HTTP deployments, a JavaScript SHA-256 fallback is used. **For production environments, always use HTTPS** to ensure maximum security.

## Getting Started

### Prerequisites
```bash
cd backend
source .venv/bin/activate
pip install flask flask-cors python-dotenv
```

Create a `.env` file in the `backend` directory with your hashed credentials:
```
FLASK_API_KEY=your-sha256-hash-here
```

**Generating your API key**: Hash your username and password combination using SHA-256.

Example using Node.js:
```bash
node -e "console.log(require('crypto').createHash('sha256').update('myusername:mypassword').digest('hex'))"
```

Example using Python:
```bash
python3 -c "import hashlib; print(hashlib.sha256('myusername:mypassword'.encode()).hexdigest())"
```

Example using online tool or browser console:
```javascript
const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('myusername:mypassword'));
console.log(Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));
```

### Quick Start (Recommended)

Use the unified runner script to start both backend and frontend servers:

```bash
./unified-runner.sh
```

This will:
- Start the Flask backend on port 5000
- Start the frontend server on port 3000
- Create timestamped log files in the `logs/` directory
- Keep both services running until you press `Ctrl+C`

Then open your browser to: http://localhost:3000

**Log Files**: All server output is saved to `logs/(timestamp)_BACKEND.txt` and `logs/(timestamp)_FRONTEND.txt`

### Manual Start (Alternative)

If you prefer to run the services separately:

**Backend (Flask API - Port 5000)**
```bash
cd backend
source .venv/bin/activate
python3 app.py
```

**Frontend (Web UI - Port 3000)**
```bash
cd frontend
python3 -m http.server 3000
```

## Design Updates

The UI has been redesigned with Microsoft Fluent UI principles:
- **Clean, Square Design**: Minimal border-radius (2px) for sharp, modern appearance
- **Fluent Color Palette**: Microsoft blue (#0078d4) for primary actions, neutral grays for text
- **Precise Shadows**: Subtle elevation using Fluent's shadow specifications
- **Typography**: Segoe UI font family with appropriate weights and spacing
- **Interactive States**: Hover and active states following Fluent guidelines
- **Form Controls**: Square inputs with 1px borders that respond to focus and hover

## API Routes:

- `GET /test-auth` - Verify API key authentication
- `GET /random-number` - Get a random number (1-100)

## Adding New Endpoints

To add a new endpoint to the API:

1. **Add the route in `backend/app.py`**:
```python
@app.route('/your-endpoint')
def your_endpoint():
    # Check authentication
    auth = check_api_key()
    if auth:
        return auth
    
    # Your logic here
    data = {"message": "Hello World"}
    return jsonify(data), 200
```

2. **Update the frontend `script.js`** to call the new endpoint:
```javascript
async function callYourEndpoint() {
    try {
        const response = await fetch(`${API_BASE_URL}/your-endpoint`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

3. **Add UI elements in `index.html`** and wire them up to your new function

## Project Structure

```
gecko-hex-dashboard/
├── backend/
│   ├── app.py              # Flask API server
│   ├── .env                # API keys (not in git)
│   └── .venv/              # Python virtual environment
└── frontend/
    ├── index.html          # Main HTML structure
    ├── style.css           # Styling
    └── script.js           # Frontend logic & API calls
```
