import { createServer } from 'node:http';
import { readFile,stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname,resolve,extname,sep } from 'node:path';
import { fireroundAdapter,providers } from './adapters.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||4173);
let current=JSON.parse(await readFile(resolve(root,'public/data/snapshot.json'),'utf8'));
let pending=null,lastAttempt=0;
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  if(url.pathname==='/api/rounds'&&req.method==='GET')return json(res,200,current);
  if(url.pathname==='/api/providers'&&req.method==='GET')return json(res,200,providers);
  if(url.pathname==='/api/refresh'&&req.method==='POST'){
   if(req.headers.origin && ![`http://localhost:${port}`,`http://127.0.0.1:${port}`].includes(req.headers.origin))return json(res,403,{error:'Refresh is only available from the local preview.'});
   if(!pending && Date.now()-lastAttempt<60000)return json(res,429,{error:'Please wait one minute between refreshes. Your last snapshot is still available.'});
   if(!pending){lastAttempt=Date.now();pending=fireroundAdapter.fetch().then(s=>(current=s)).finally(()=>{pending=null;});}
   try{return json(res,200,await pending);}catch(e){return json(res,502,{error:e.message,retainedSnapshot:true});}
  }
  if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method not allowed'});
  if(url.pathname.startsWith('/api/'))return json(res,404,{error:'API endpoint not found'});
  let path=decodeURIComponent(url.pathname);
  if(path==='/'||path==='/index.html')path='/index.html';
  else if(!path.startsWith('/src/')&&!path.startsWith('/data/')&&path!=='/favicon.svg')return json(res,404,{error:'Not found'});
  const base=path.startsWith('/data/')||path==='/favicon.svg'?resolve(root,'public'):root;
  const file=resolve(base,'.'+path);if(!file.startsWith(base+sep))return json(res,403,{error:'Forbidden'});
  await stat(file);const body=await readFile(file);
  res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:body);
 }catch(e){json(res,e.code==='ENOENT'?404:500,{error:e.code==='ENOENT'?'File not found':'Unable to load this resource'});}
});
server.listen(port,'127.0.0.1',()=>console.log(`Capital Current preview: http://127.0.0.1:${port}`));
