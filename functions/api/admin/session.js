import { requireAdmin } from './_auth.js';
export async function onRequest(context){const denied=await requireAdmin(context);if(denied)return denied;return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json'}})}
