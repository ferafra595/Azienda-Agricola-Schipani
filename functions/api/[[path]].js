const enc = new TextEncoder();

const DEFAULT_CONTENT = {
  images: {
    logo: '/logo-schipani.jpg',
    home_hero: 'https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&w=2000&q=85',
    home_story_left: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1200&q=85',
    home_story_right: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=85',
    values_background: 'https://images.unsplash.com/photo-1470165518243-ff5a7f59f38d?auto=format&fit=crop&w=1800&q=70',
    story_left: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1200&q=85',
    story_right: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=85'
  },
  story: {
    home_title: 'Una passione che nasce dalla terra',
    home_p1: "L'Azienda Agricola Schipani nasce oltre vent'anni fa a Mesoraca, nel cuore della Calabria, da una profonda passione per la nostra terra e per l'olivo.",
    home_p2: 'Da generazioni coltiviamo i nostri uliveti con cura e rispetto, tramandando valori autentici e un sapere che unisce esperienza e innovazione.',
    page_kicker: 'Radici · Famiglia · Territorio',
    page_title: 'Una storia che cresce insieme ai nostri ulivi.',
    page_intro: "Una storia di famiglia, lavoro e rispetto per una terra che da più di vent'anni accompagna ogni nostra scelta.",
    years: '20+',
    years_text: "Anni di esperienza raccontati attraverso un prodotto solo: il nostro olio extravergine d'oliva.",
    origins_kicker: 'Le origini',
    origins_title: 'Dalla terra di famiglia a un progetto agricolo.',
    origins_p1: "L'Azienda Agricola Schipani nasce a Mesoraca tra la fine degli anni Novanta e i primi anni Duemila, da una passione coltivata prima ancora che come lavoro: quella per gli ulivi, per la campagna e per i ritmi autentici della terra.",
    origins_p2: "Nel tempo, ciò che era un sapere custodito in famiglia è diventato un progetto più strutturato. Gli uliveti sono rimasti il cuore dell'azienda, così come la volontà di seguire da vicino ogni passaggio, senza perdere il rapporto diretto con il territorio.",
    origins_p3: 'Oggi continuiamo a lavorare con la stessa idea: produrre un olio capace di raccontare Mesoraca e la Calabria attraverso semplicità, cura e riconoscibilità.',
    present_kicker: 'Il presente',
    present_title: 'Tradizione che guarda avanti.',
    present_text: "Esperienza e innovazione non sono opposti: per noi significano prendersi cura degli uliveti con maggiore consapevolezza e dare valore al prodotto finale senza snaturarne l'identità."
  }
};

export async function onRequest(context) {
  const { request, env, params } = context;
  const method = request.method.toUpperCase();
  const parts = Array.isArray(params.path) ? params.path : String(params.path || '').split('/').filter(Boolean);
  const path = parts.join('/');

  if (path === 'config' && method === 'GET') return getConfig(env);
  if (path === 'content' && method === 'GET') return getPublicContent(env);
  if (path === 'products' && method === 'GET') return getPublicProducts(env);

  if (path === 'admin/login' && method === 'POST') return login(request, env);
  if (path === 'admin/session') return session(context);
  if (path === 'admin/logout' && method === 'POST') return logout();
  if (path === 'admin/upload' && method === 'POST') return upload(context);
  if (path === 'admin/content' && method === 'GET') return getAdminContent(context);
  if (path === 'admin/content' && method === 'PUT') return saveAdminContent(context);
  if (path === 'admin/products' && method === 'GET') return getAdminProducts(context);
  if (path === 'admin/products' && method === 'POST') return createProduct(context);

  const productMatch = path.match(/^admin\/products\/(\d+)$/);
  if (productMatch && method === 'PUT') return updateProduct(context, Number(productMatch[1]));
  if (productMatch && method === 'DELETE') return deleteProduct(context, Number(productMatch[1]));

  if (path.startsWith('media/') && method === 'GET') return getMedia(env, path.slice(6));

  return json({ error: 'Endpoint non trovato' }, 404);
}

async function getConfig(env){
  let whatsapp='';
  try{const r=await env.DB.prepare("SELECT value FROM settings WHERE key='whatsapp'").first();whatsapp=r?.value||''}catch{}
  return json({whatsapp},200,{'Cache-Control':'public, max-age=60'});
}

async function getPublicProducts(env){
  try{const {results}=await env.DB.prepare('SELECT id,name,size,price,description,image_url,active,sort_order FROM products WHERE active=1 ORDER BY sort_order ASC,id ASC').all();return json({products:results||[]},200,{'Cache-Control':'public, max-age=60'})}
  catch{return json({products:[],error:'Database non configurato'},200,{'Cache-Control':'public, max-age=60'})}
}

async function getPublicContent(env){
  const content=await currentContent(env);
  return json({content},200,{'Cache-Control':'no-store'});
}

async function getAdminContent(context){
  const denied=await requireAdmin(context); if(denied)return denied;
  return json({content:await currentContent(context.env)});
}

async function saveAdminContent(context){
  const denied=await requireAdmin(context); if(denied)return denied;
  let body={};try{body=await context.request.json()}catch{return json({error:'Dati non validi'},400)}
  const next=merge(await currentContent(context.env),body.content||body||{});
  await context.env.DB.prepare("INSERT INTO settings(key,value) VALUES('site_content',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify(next)).run();
  return json({ok:true,content:next});
}

async function getAdminProducts(context){
  const d=await requireAdmin(context);if(d)return d;
  try{const {results}=await context.env.DB.prepare('SELECT * FROM products ORDER BY sort_order ASC,id ASC').all();return json({products:results||[]})}
  catch{return json({error:'Database non configurato'},500)}
}

async function createProduct(context){
  const d=await requireAdmin(context);if(d)return d;
  let b;try{b=await context.request.json()}catch{return json({error:'Dati non validi'},400)}
  if(!b.name||!b.size||!Number.isFinite(Number(b.price)))return json({error:'Nome, formato e prezzo sono obbligatori'},400);
  const max=await context.env.DB.prepare('SELECT COALESCE(MAX(sort_order),0) m FROM products').first();
  const r=await context.env.DB.prepare('INSERT INTO products (name,size,price,description,image_url,active,sort_order) VALUES (?,?,?,?,?,?,?)').bind(b.name,b.size,Number(b.price),b.description||'',b.image_url||null,b.active?1:0,Number(max?.m||0)+1).run();
  return json({ok:true,id:r.meta.last_row_id},201);
}

async function updateProduct(context,id){
  const d=await requireAdmin(context);if(d)return d;
  let b;try{b=await context.request.json()}catch{return json({error:'Dati non validi'},400)}
  if(!b.name||!b.size||!Number.isFinite(Number(b.price)))return json({error:'Nome, formato e prezzo sono obbligatori'},400);
  await context.env.DB.prepare('UPDATE products SET name=?,size=?,price=?,description=?,image_url=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(b.name,b.size,Number(b.price),b.description||'',b.image_url||null,b.active?1:0,id).run();
  return json({ok:true});
}

async function deleteProduct(context,id){
  const d=await requireAdmin(context);if(d)return d;
  await context.env.DB.prepare('DELETE FROM products WHERE id=?').bind(id).run();
  return json({ok:true});
}

async function login(request,env){
  if(!env.ADMIN_PASSWORD||!env.ADMIN_SESSION_SECRET)return json({error:'Configura ADMIN_PASSWORD e ADMIN_SESSION_SECRET su Cloudflare.'},500);
  let body;try{body=await request.json()}catch{return json({error:'Richiesta non valida'},400)}
  if(String(body.password||'')!==String(env.ADMIN_PASSWORD))return json({error:'Password non corretta'},401);
  const token=await makeSession(env.ADMIN_SESSION_SECRET);
  return json({ok:true},200,{'Set-Cookie':`schipani_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200`});
}

async function session(context){
  const denied=await requireAdmin(context);if(denied)return denied;
  return json({ok:true});
}

function logout(){
  return json({ok:true},200,{'Set-Cookie':'schipani_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
}

async function upload(context){
  const d=await requireAdmin(context);if(d)return d;
  if(!context.env.MEDIA)return json({error:'Bucket R2 MEDIA non configurato'},500);
  const form=await context.request.formData(); const file=form.get('file');
  if(!(file instanceof File))return json({error:'File mancante'},400);
  if(file.size>5*1024*1024)return json({error:'Foto troppo grande. Massimo 5 MB.'},400);
  const allowed=['image/jpeg','image/png','image/webp']; if(!allowed.includes(file.type))return json({error:'Formato non supportato'},400);
  const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
  const folder=String(form.get('folder')||'uploads').replace(/[^a-z0-9_-]/gi,'').slice(0,32)||'uploads';
  const key=`${folder}/${crypto.randomUUID()}.${ext}`;
  await context.env.MEDIA.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:'public, max-age=31536000, immutable'}});
  return json({url:`/api/media/${key}`});
}

async function getMedia(env,key){
  if(!env.MEDIA)return new Response('Media non configurati',{status:404});
  const obj=await env.MEDIA.get(key); if(!obj)return new Response('Not found',{status:404});
  const headers=new Headers(); obj.writeHttpMetadata(headers); headers.set('etag',obj.httpEtag); headers.set('Cache-Control','public, max-age=31536000, immutable');
  return new Response(obj.body,{headers});
}

async function currentContent(env){
  let saved=null;
  try{const row=await env.DB.prepare("SELECT value FROM settings WHERE key='site_content'").first();if(row?.value)saved=JSON.parse(row.value)}catch{}
  return merge(DEFAULT_CONTENT,saved||{});
}
function merge(base,extra){return {images:{...base.images,...(extra.images||{})},story:{...base.story,...(extra.story||{})}}}

function b64url(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
async function hmac(secret,value){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64url(await crypto.subtle.sign('HMAC',key,enc.encode(value)))}
async function makeSession(secret){const exp=Date.now()+1000*60*60*12;const payload=`admin.${exp}`;return `${payload}.${await hmac(secret,payload)}`}
async function validSession(request,secret){
  if(!secret)return false;
  const cookie=request.headers.get('Cookie')||'';
  const token=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('schipani_admin='))?.split('=')[1];
  if(!token)return false;
  const parts=token.split('.'); if(parts.length!==3)return false;
  const payload=`${parts[0]}.${parts[1]}`;
  if(parts[0]!=='admin'||Number(parts[1])<Date.now())return false;
  const expected=await hmac(secret,payload); return timingSafe(expected,parts[2]);
}
function timingSafe(a,b){if(a.length!==b.length)return false;let out=0;for(let i=0;i<a.length;i++)out|=a.charCodeAt(i)^b.charCodeAt(i);return out===0}
async function requireAdmin(context){if(!await validSession(context.request,context.env.ADMIN_SESSION_SECRET))return json({error:'Sessione non valida'},401);return null}

function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json',...extra}})}
