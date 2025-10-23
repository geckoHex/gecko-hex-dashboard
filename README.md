# Gecko Hex Dashboard

A full-stack web application with a Flask REST API backend and vanilla JavaScript frontend. The project provides a secure, API-key authenticated interface for interacting with backend services.

## Core Functionality

- **API Key Authentication**: All endpoints are protected with X-API-Key header authentication
- **RESTful API**: Flask-based backend exposing JSON endpoints
- **Web Interface**: Simple, modern UI with login flow and session management
- **CORS Enabled**: Backend configured to communicate with frontend on different ports

## Getting Started

### Prerequisites
```bash
cd backend
source .venv/bin/activate
pip install flask flask-cors python-dotenv
```

Create a `.env` file in the `backend` directory:
```
FLASK_API_KEY=your-secret-key-here
```

### Backend (Flask API - Port 5000)
```bash
cd backend
source .venv/bin/activate
python3 app.py
```

### Frontend (Web UI - Port 3000)
```bash
cd frontend
python3 -m http.server 3000
```

Then open your browser to: http://localhost:3000

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
