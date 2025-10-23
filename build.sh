#!/bin/bash

# Build script for gecko-hex-dashboard
# Creates a distributable zip file with all necessary files

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="gecko-server"
ZIP_NAME="gecko-server.zip"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}Starting build process...${NC}"

# Clean up any existing build artifacts
if [ -d "$BUILD_DIR" ]; then
    echo -e "${BLUE}Removing existing build directory...${NC}"
    rm -rf "$BUILD_DIR"
fi

if [ -f "$ZIP_NAME" ]; then
    echo -e "${BLUE}Removing existing zip file...${NC}"
    rm -f "$ZIP_NAME"
fi

# Create build directory
echo -e "${BLUE}Creating build directory: $BUILD_DIR${NC}"
mkdir -p "$BUILD_DIR"

# Copy files while respecting .gitignore
echo -e "${BLUE}Copying files (excluding .gitignore patterns)...${NC}"

# Use rsync to copy files while excluding patterns from .gitignore
rsync -av \
    --exclude='.DS_Store' \
    --exclude='.vscode' \
    --exclude='__pycache__/' \
    --exclude='.venv/' \
    --exclude='.env' \
    --exclude='logs/' \
    --exclude='.git/' \
    --exclude="$BUILD_DIR" \
    --exclude="$ZIP_NAME" \
    "$PROJECT_ROOT/" "$BUILD_DIR/"

# Display what was copied
echo -e "${GREEN}Files copied to $BUILD_DIR:${NC}"
find "$BUILD_DIR" -type f | sed 's|^|  |'

# Create zip file
echo -e "${BLUE}Creating zip archive: $ZIP_NAME${NC}"
zip -r "$ZIP_NAME" "$BUILD_DIR" > /dev/null

# Get zip file size
ZIP_SIZE=$(du -h "$ZIP_NAME" | cut -f1)

# Clean up build directory
echo -e "${BLUE}Cleaning up build directory...${NC}"
rm -rf "$BUILD_DIR"

# Success message
echo -e "${GREEN}✓ Build complete!${NC}"
echo -e "${GREEN}  Archive: $ZIP_NAME${NC}"
echo -e "${GREEN}  Size: $ZIP_SIZE${NC}"
echo ""
echo -e "${BLUE}To deploy:${NC}"
echo -e "  1. Extract the zip file: ${GREEN}unzip $ZIP_NAME${NC}"
echo -e "  2. Navigate to the folder: ${GREEN}cd $BUILD_DIR${NC}"
echo -e "  3. Run the installation: ${GREEN}./install.sh${NC}"
echo -e "  4. Start the server: ${GREEN}./unified-runner.sh${NC}"
