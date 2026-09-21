import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const root = new URL('./public/', import.meta.url);
const types = {html:'text/html; charset=utf-8',css:'text/css',js:'text/javascript',ico:'image/x-icon',ttf:'font/ttf',woff2:'font/woff2',txt:'text/plain; charset=utf-8'};
createServer(async (req,res) => {
  const path = new URL(req.url,'http://localhost').pathname;
  if (!/^\/(index.html|style.css|app.js|core.js|theme.js|theme.css|fonts.js)?$/.test(path)&&!/^\/fonts\/[A-Za-z0-9.-]+\.(ttf|woff2|txt|html)$/.test(path)) { res.writeHead(404); return res.end('Not found'); }
  try { const name = path === '/' ? 'index.html' : path.slice(1); res.writeHead(200,{'Content-Type':types[name.split('.').pop()], 'X-Content-Type-Options':'nosniff'}); res.end(await readFile(new URL(name,root))); }
  catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT)||8003,'127.0.0.1',()=>console.log('Studio: http://127.0.0.1:8003'));
