#!/usr/bin/env node

// Startup Banner with Brand Color - Wide to match logs
const brand = '\x1b[38;2;239;144;67m';  // #ef9043
const gray = '\x1b[90m';
const white = '\x1b[97m';
const reset = '\x1b[0m';
const bold = '\x1b[1m';

const width = 130; // Width to match long log lines
const line = '─'.repeat(width);

console.clear();
console.log('');
console.log(`${brand}${bold}  ┌${line}┐${reset}`);
console.log(`${brand}${bold}  │${reset}${' '.repeat(width)}${brand}${bold}│${reset}`);
console.log(`${brand}${bold}  │${reset}${' '.repeat(45)}${white}${bold}InsightHub Development Environment${reset}${' '.repeat(51)}${brand}${bold}│${reset}`);
console.log(`${brand}${bold}  │${reset}${' '.repeat(58)}${gray}v1.1.0${reset}${' '.repeat(66)}${brand}${bold}│${reset}`);
// Calculate proper spacing for "Powered by 3D|Diagnostix" (25 chars)
const poweredByText = 'Powered by 3D|Diagnostix';
const poweredByPadding = Math.floor((width - poweredByText.length) / 2);
console.log(`${brand}${bold}  │${reset}${' '.repeat(poweredByPadding)}${brand}${poweredByText}${reset}${' '.repeat(width - poweredByPadding - poweredByText.length)}${brand}${bold}│${reset}`);
console.log(`${brand}${bold}  │${reset}${' '.repeat(width)}${brand}${bold}│${reset}`);
console.log(`${brand}${bold}  └${line}┘${reset}`);
console.log('');
console.log(`  ${gray}Starting services...${reset}`);
console.log('');
console.log(`  ${brand}▪${reset} ${white}CLIENT${reset}  ${gray}→${reset}  ${bold}http://localhost:3000${reset}  ${gray}Vue 3 + Vuetify${reset}`);
console.log(`  ${brand}▪${reset} ${white}SERVER${reset}  ${gray}→${reset}  ${bold}http://localhost:3001${reset}  ${gray}Express + Casbin${reset}`);
console.log(`  ${brand}▪${reset} ${white}DOCS${reset}    ${gray}→${reset}  ${bold}http://localhost:5173${reset}  ${gray}VitePress${reset}`);
console.log('');
console.log(`${gray}  ${line}${reset}`);
console.log('');

