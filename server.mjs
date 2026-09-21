import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const root = new URL('./public/', import.meta.url);
const types = {html:'text/html; charset=utf-8',css:'text/css',js:'text/javascript',ico:'image/x-icon'};
createServer(async (req,res) => {
  const path = new URL(req.url,'http://localhost').pathname;
  if (!/^\/(index.html|style.css|app.js|core.js)?$/.test(path)) { res.writeHead(404); return res.end('Not found'); }
  try { const name = path === '/' ? 'index.html' : path.slice(1); res.writeHead(200,{'Content-Type':types[name.split('.').pop()], 'X-Content-Type-Options':'nosniff'}); res.end(await readFile(new URL(name,root))); }
  catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT)||8003,'127.0.0.1',()=>console.log('Studio: http://127.0.0.1:8003'));
