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
    
    // Check if crypto.subtle is available (HTTPS or localhost)
    if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(credentials);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } else {
        // Fallback for HTTP contexts
        console.warn('crypto.subtle not available - using fallback SHA-256 implementation');
        console.warn('For production, please use HTTPS to enable secure crypto.subtle API');
        return sha256(credentials);
    }
}

// Pure JavaScript SHA-256 implementation for non-secure contexts
// Based on: https://geraintluff.github.io/sha256/
function sha256(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }
    
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = 'length';
    let i, j;
    let result = '';

    const words = [];
    const asciiBitLength = ascii[lengthProperty] * 8;
    
    let hash = sha256.h = sha256.h || [];
    const k = sha256.k = sha256.k || [];
    let primeCounter = k[lengthProperty];

    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }
    
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return;
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);
    
    for (j = 0; j < words[lengthProperty];) {
        const w = words.slice(j, j += 16);
        const oldHash = hash;
        hash = hash.slice(0, 8);
        
        for (i = 0; i < 64; i++) {
            const w15 = w[i - 15], w2 = w[i - 2];
            const a = hash[0], e = hash[4];
            const temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                + ((e & hash[5]) ^ ((~e) & hash[6]))
                + k[i]
                + (w[i] = (i < 16) ? w[i] : (
                    w[i - 16]
                    + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                    + w[i - 7]
                    + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                ) | 0
                );
            const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
            
            hash = [(temp1 + temp2) | 0].concat(hash);
            hash[4] = (hash[4] + temp1) | 0;
        }
        
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }
    
    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            const b = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
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
