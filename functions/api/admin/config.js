export async function onRequestGet({env}){
  let whatsapp='';
  try{const r=await env.DB.prepare("SELECT value FROM settings WHERE key='whatsapp'").first();whatsapp=r?.value||''}catch{}
  return new Response(JSON.stringify({whatsapp}),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=60'}})
}
