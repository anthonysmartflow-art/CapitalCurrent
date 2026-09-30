import {mkdir,cp,readFile,writeFile} from 'node:fs/promises';
const base=new URL('../',import.meta.url),out=new URL('../dist/',import.meta.url);
await mkdir(out,{recursive:true});
for(const name of ['index.html','src'])await cp(new URL(name,base),new URL(name,out),{recursive:true});
await cp(new URL('public/',base),out,{recursive:true});
const hosted=process.argv.includes('--server');
if(!hosted)await writeFile(new URL('index.html',out),(await readFile(new URL('index.html',out),'utf8')).replace('name="data-mode" content="server"','name="data-mode" content="snapshot"'));
console.log(hosted?'Vercel frontend built in dist/. Live endpoints are in api/.':'Static preview built in dist/. Live refresh requires npm start (Node server).');
