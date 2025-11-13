#!/bin/bash

# Server wrapper with box frame - Wide to match logs
BRAND='\033[38;2;239;144;67m'  # #ef9043
RESET='\033[0m'
BOLD='\033[1m'

# Create line (130 chars wide)
LINE=$(printf '─%.0s' {1..130})

# Server logs box
echo -e ""
echo -e "${BRAND}${BOLD}  ┌${LINE}┐${RESET}"
echo -e "${BRAND}${BOLD}  │${RESET}$(printf ' %.0s' {1..58})${BOLD}SERVER LOGS${RESET}$(printf ' %.0s' {1..61})${BRAND}${BOLD}│${RESET}"
echo -e "${BRAND}${BOLD}  └${LINE}┘${RESET}"
echo -e ""

# Run the server with proper indentation (2 spaces to align with box)
cd server && npm run dev --silent 2>&1 | while IFS= read -r line; do
    echo "  $line"
done

