#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Gecko Hex Dashboard Installer${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
ENV_FILE="$BACKEND_DIR/.env"

# Step 1: Collect root username and password
echo -e "${YELLOW}Step 1: Setting up root credentials${NC}"
echo ""

read -p "Enter root username: " ROOT_USERNAME

# Read password securely (without displaying it)
while true; do
    read -s -p "Enter root password: " ROOT_PASSWORD
    echo ""
    read -s -p "Confirm root password: " ROOT_PASSWORD_CONFIRM
    echo ""
    
    if [ "$ROOT_PASSWORD" = "$ROOT_PASSWORD_CONFIRM" ]; then
        break
    else
        echo -e "${RED}Passwords do not match. Please try again.${NC}"
        echo ""
    fi
done

# Validate inputs
if [ -z "$ROOT_USERNAME" ] || [ -z "$ROOT_PASSWORD" ]; then
    echo -e "${RED}Error: Username and password cannot be empty${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Credentials collected${NC}"
echo ""

# Step 2: Hash the credentials using SHA256
echo -e "${YELLOW}Step 2: Hashing credentials securely${NC}"

# Check if shasum is available
if ! command -v shasum &> /dev/null; then
    echo -e "${RED}Error: shasum is required but not installed${NC}"
    exit 1
fi

# Hash the username:password combination using SHA256
CREDENTIALS_HASH=$(echo -n "${ROOT_USERNAME}:${ROOT_PASSWORD}" | shasum -a 256 | awk '{print $1}')

if [ -z "$CREDENTIALS_HASH" ]; then
    echo -e "${RED}Error: Failed to hash credentials${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Credentials hashed successfully${NC}"
echo ""

# Step 3: Update .env file
echo -e "${YELLOW}Step 3: Updating .env file${NC}"

# Create backend directory if it doesn't exist
mkdir -p "$BACKEND_DIR"

# Backup existing .env if it exists
if [ -f "$ENV_FILE" ]; then
    BACKUP_FILE="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo -e "${BLUE}  Backed up existing .env to: $(basename $BACKUP_FILE)${NC}"
fi

# Read existing API key if present
EXISTING_API_KEY=""
if [ -f "$ENV_FILE" ] && grep -q "FLASK_API_KEY=" "$ENV_FILE"; then
    EXISTING_API_KEY=$(grep "FLASK_API_KEY=" "$ENV_FILE" | cut -d'=' -f2-)
fi

# Use the credentials hash as the API key
EXISTING_API_KEY="$CREDENTIALS_HASH"

# Write to .env file
cat > "$ENV_FILE" << EOF
FLASK_API_KEY=${EXISTING_API_KEY}
EOF

echo -e "${GREEN}✓ .env file updated${NC}"
echo ""

# Step 4: Install backend dependencies
echo -e "${YELLOW}Step 4: Installing backend dependencies${NC}"

cd "$BACKEND_DIR"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is required but not installed${NC}"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo -e "${BLUE}  Creating virtual environment...${NC}"
    python3 -m venv .venv
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to create virtual environment${NC}"
        exit 1
    fi
    echo -e "${GREEN}  ✓ Virtual environment created${NC}"
else
    echo -e "${BLUE}  Virtual environment already exists${NC}"
fi

# Activate virtual environment
source .venv/bin/activate

# Upgrade pip
echo -e "${BLUE}  Upgrading pip...${NC}"
pip install --upgrade pip > /dev/null 2>&1

# Install dependencies
echo -e "${BLUE}  Installing Flask and dependencies...${NC}"
pip install flask flask-cors python-dotenv

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}Error: Failed to install dependencies${NC}"
    deactivate
    exit 1
fi

# Create requirements.txt for future reference
echo -e "${BLUE}  Creating requirements.txt...${NC}"
pip freeze > requirements.txt
echo -e "${GREEN}  ✓ requirements.txt created${NC}"

deactivate

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  Installation Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo -e "  • Root username: ${GREEN}${ROOT_USERNAME}${NC}"
echo -e "  • Password: ${GREEN}[hashed and stored securely]${NC}"
echo -e "  • API Key (Hash): ${GREEN}${CREDENTIALS_HASH}${NC}"
echo -e "  • Config file: ${GREEN}backend/.env${NC}"
echo -e "  • Dependencies: ${GREEN}Installed in backend/.venv${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Run ${BLUE}./unified-runner.sh${NC} to start the application"
echo -e "  2. Or activate the backend environment: ${BLUE}source backend/.venv/bin/activate${NC}"
echo ""
