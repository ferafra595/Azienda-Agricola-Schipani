export async function onRequestGet({env}){
 try{const {results}=await env.DB.prepare('SELECT id,name,size,price,description,image_url,active,sort_order FROM products WHERE active=1 ORDER BY sort_order ASC,id ASC').all();return json({products:results||[]})}
 catch(e){return json({products:[],error:'Database non configurato'},200)}
}
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=60'}});
