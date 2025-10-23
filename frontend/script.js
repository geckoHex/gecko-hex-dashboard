// API Configuration
const API_BASE_URL = 'http://localhost:5000';

// CORS is enabled on backend for port 3000

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const getRandomBtn = document.getElementById('getRandomBtn');
const randomResult = document.getElementById('randomResult');
const addNumbersBtn = document.getElementById('addNumbersBtn');
const addResult = document.getElementById('addResult');

// Store API key in session storage
let apiKey = sessionStorage.getItem('apiKey');

// Check if user is already logged in
if (apiKey) {
    verifyApiKey();
}

// Function to hash username and password
async function hashCredentials(username, password) {
    const credentials = `${username}:${password}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(credentials);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Hash the credentials to create API key
    const key = await hashCredentials(username, password);
    
    // Test the API key
    try {
        const response = await fetch(`${API_BASE_URL}/test-auth`, {
            method: 'GET',
            headers: {
                'X-API-Key': key
            }
        });
        
        if (response.ok) {
            apiKey = key;
            sessionStorage.setItem('apiKey', key);
            showDashboard();
            loginError.textContent = '';
        } else {
            loginError.textContent = 'Invalid username or password. Please try again.';
        }
    } catch (error) {
        loginError.textContent = 'Error connecting to server. Please try again.';
        console.error('Login error:', error);
    }
});

// Verify API key on page load
async function verifyApiKey() {
    try {
        const response = await fetch(`${API_BASE_URL}/test-auth`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey
            }
        });
        
        if (response.ok) {
            showDashboard();
        } else {
            logout();
        }
    } catch (error) {
        console.error('Verification error:', error);
        logout();
    }
}

// Show dashboard
function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'grid';
}

// Show login
function showLogin() {
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
}

// Logout
function logout() {
    apiKey = null;
    sessionStorage.removeItem('apiKey');
    showLogin();
    randomResult.innerHTML = '<div class="data-placeholder">Click the button to generate a random number</div>';
    addResult.innerHTML = '<div class="data-placeholder">Enter two numbers and click Calculate Sum</div>';
}

logoutBtn.addEventListener('click', logout);

// Sidebar navigation
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function() {
        // Remove active class from all items
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        this.classList.add('active');
        
        // Hide all pages
        document.querySelectorAll('.content-page').forEach(page => page.classList.remove('active'));
        
        // Show the selected page
        const endpoint = this.getAttribute('data-endpoint');
        if (endpoint === 'random-number') {
            document.getElementById('randomNumberEndpoint').classList.add('active');
        } else if (endpoint === 'add-numbers') {
            document.getElementById('addNumbersEndpoint').classList.add('active');
        }
    });
});

// Get random number
getRandomBtn.addEventListener('click', async () => {
    // Show loading state
    randomResult.innerHTML = '<div class="data-placeholder">Loading...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/random-number`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            randomResult.innerHTML = `<div class="data-value">${data.number}</div>`;
        } else if (response.status === 401) {
            logout();
            alert('Session expired. Please login again.');
        } else {
            randomResult.innerHTML = '<div class="data-placeholder" style="color: #a4262c;">Error fetching random number</div>';
        }
    } catch (error) {
        randomResult.innerHTML = '<div class="data-placeholder" style="color: #a4262c;">Error connecting to server</div>';
        console.error('Random number error:', error);
    }
});

// Add numbers
addNumbersBtn.addEventListener('click', async () => {
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    
    const num1 = num1Input.value;
    const num2 = num2Input.value;
    
    // Validate inputs
    if (!num1 || !num2) {
        addResult.innerHTML = '<div class="data-placeholder" style="color: #a4262c;">Please enter both numbers</div>';
        return;
    }
    
    // Show loading state
    addResult.innerHTML = '<div class="data-placeholder">Calculating...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/add-numbers`, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                num1: parseInt(num1),
                num2: parseInt(num2)
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            addResult.innerHTML = `<div class="data-value">${data.num1} + ${data.num2} = ${data.result}</div>`;
        } else if (response.status === 401) {
            logout();
            alert('Session expired. Please login again.');
        } else {
            const error = await response.json();
            addResult.innerHTML = `<div class="data-placeholder" style="color: #a4262c;">${error.error || 'Error calculating sum'}</div>`;
        }
    } catch (error) {
        addResult.innerHTML = '<div class="data-placeholder" style="color: #a4262c;">Error connecting to server</div>';
        console.error('Add numbers error:', error);
    }
});
