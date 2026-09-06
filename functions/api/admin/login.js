import { makeSession } from './_auth.js';
export async function onRequestPost({request,env}){
  if(!env.ADMIN_PASSWORD||!env.ADMIN_SESSION_SECRET)return json({error:'Configura ADMIN_PASSWORD e ADMIN_SESSION_SECRET su Cloudflare.'},500);
  let body;try{body=await request.json()}catch{return json({error:'Richiesta non valida'},400)}
  if(String(body.password||'')!==String(env.ADMIN_PASSWORD))return json({error:'Password non corretta'},401);
  const token=await makeSession(env.ADMIN_SESSION_SECRET);
  return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Set-Cookie':`schipani_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=43200`}})
}
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{'Content-Type':'application/json'}});
