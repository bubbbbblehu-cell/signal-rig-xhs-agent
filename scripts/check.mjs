import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
assert.equal(readdirSync('dist').filter(n=>n.endsWith('.html')).length,1,'Exactly one HTML entry');
const html=readFileSync('dist/index.html','utf8');
assert(!/<script(?![^>]*src=)[^>]*>\s*\S/i.test(html),'Inline JS');
assert(!/\son\w+\s*=|<iframe|<object|\sdownload[=>\s]/i.test(html),'Prohibited HTML');
for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){assert(m[1].startsWith('./'),'Must use package relative paths');assert(existsSync('dist/'+m[1].slice(2)),'Missing '+m[1]);}
for(const name of readdirSync('dist')){assert(/\.(html|css|js|png|jpe?g|webp|gif|svg|woff2?|json)$/.test(name),'Unsupported file '+name);assert(statSync('dist/'+name).size<2*1024*1024,'Single asset too large '+name);}
const app=readFileSync('app/main.js','utf8');assert(!/\b(fetch|XMLHttpRequest|WebSocket|Worker|eval)\s*\(|new Function|navigator\.clipboard|requestFullscreen|window\.open|\.download\s*=/.test(app),'Forbidden application capability');
assert(!/https?:\/\//.test(readFileSync('dist/style.css','utf8')),'Remote CSS resource');
assert(!/AgentRuntime|@vectorx/.test(readFileSync('package.json','utf8')),'Agent runtime dependency');
console.log('PASS: root entry, local resources, external scripts, file allowlist, asset budgets, offline application, no AgentRuntime.');

const bundle=readFileSync('dist/app.js','utf8');assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|new Worker|new Function|eval\s*\(/.test(bundle),'Prohibited capability survived bundling');
