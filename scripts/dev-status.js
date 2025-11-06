#!/usr/bin/env node
const c = (s) => `\x1b[36m${s}\x1b[0m`;
const g = (s) => `\x1b[32m${s}\x1b[0m`;
const y = (s) => `\x1b[33m${s}\x1b[0m`;
const m = (s) => `\x1b[35m${s}\x1b[0m`;

console.log(`\n`);
console.log('┌─────────┬─────────────┬───────────────┐');
console.log('│ Service │ Status      │ Port/Path     │');
console.log('├─────────┼─────────────┼───────────────┤');
console.log(`│ ${c('Client ')}│ ${g('Running')}    │ ${y('5173')}         │`);
console.log(`│ ${c('Server ')}│ ${g('Running')}    │ ${y('3001')}         │`);
console.log(`│ ${c('Docs   ')}│ ${g('Running')}    │ ${y('8080')}         │`);
console.log(`│ ${m('Nodemon')}│ ${g('Watching')}    │ ${y('src/index.js')} │`);
console.log('└─────────┴─────────────┴───────────────┘');
console.log('\n');
