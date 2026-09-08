const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];

// CONTATTI AZIENDALI — modifica qui il numero se cambia in futuro
const CONTACTS={
  whatsapp:'393883879796',
  phone:'+393883879796',
  display:'+39 388 387 9796'
};
qsa('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const menuBtn=qs('[data-menu-toggle]'),menu=qs('[data-menu]');if(menuBtn&&menu)menuBtn.addEventListener('click',()=>menu.classList.toggle('open'));
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.1});qsa('.reveal').forEach(el=>observer.observe(el))}else qsa('.reveal').forEach(el=>el.classList.add('visible'));
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function wa(number,text){const d=(number||'').replace(/\D/g,'');return d?`https://wa.me/${d}?text=${encodeURIComponent(text)}`:'#'}
async function config(){return{whatsapp:CONTACTS.whatsapp}}
function bottle(p){return p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}">`:`<div class="bottle product-placeholder-bottle"><span>SCHIPANI</span><small>${esc(p.size||'OLIO EVO')}</small></div>`}
function card(p,cfg){const msg=`Ciao, vorrei acquistare ${p.name} (${p.size}) al prezzo di € ${Number(p.price).toFixed(2)}. È disponibile?`;return `<article class="product-card"><a href="/prodotti.html" aria-label="Apri ${esc(p.name)}"><div class="product-image">${bottle(p)}</div><div class="product-info"><h3>${esc(p.name)}</h3><span class="price">€ ${Number(p.price).toFixed(2).replace('.',',')}</span><p>${esc(p.size||'')}</p></div></a><a class="card-wa" target="_blank" rel="noopener" href="${wa(cfg.whatsapp,msg)}">◉ &nbsp;Richiedi ora</a></article>`}
(async()=>{const cfg=await config();const generic=wa(cfg.whatsapp,'Ciao, vorrei informazioni sull’olio dell’Azienda Agricola Schipani.');['#home-whatsapp','#nav-whatsapp','#contact-whatsapp'].forEach(s=>{const e=qs(s);if(e)e.href=generic});const call=qs('#contact-phone');if(call)call.href=`tel:${CONTACTS.phone}`;qsa('[data-phone-display]').forEach(e=>e.textContent=CONTACTS.display);const root=qs('#home-products');if(root){try{const r=await fetch('/api/products');if(!r.ok)throw 0;const d=await r.json();const items=(d.products||[]).slice(0,5);root.innerHTML=items.length?items.map(p=>card(p,cfg)).join(''):'<p>Catalogo in aggiornamento.</p>'}catch{root.innerHTML='<p>Il catalogo sarà disponibile appena collegherai il database Cloudflare D1.</p>'}}})();

async function loadSiteContent(){
  try{
    const r=await fetch('/api/content',{cache:'no-store'}); if(!r.ok)return;
    const d=await r.json(); const c=d.content||{};
    const images=c.images||{}, story=c.story||{};
    qsa('[data-content-image]').forEach(el=>{const v=images[el.dataset.contentImage];if(v)el.src=v});
    qsa('[data-content-bg]').forEach(el=>{const v=images[el.dataset.contentBg];if(!v)return;const isHero=el.classList.contains('hero-photo');const isValues=el.classList.contains('values-band');let overlay='';if(isHero)overlay='linear-gradient(90deg,rgba(11,22,10,.82),rgba(11,22,10,.3) 55%,rgba(11,22,10,.12)),';else if(isValues)overlay='linear-gradient(rgba(18,36,15,.94),rgba(18,36,15,.94)),';else overlay='linear-gradient(rgba(20,35,13,.06),rgba(20,35,13,.14)),';el.style.backgroundImage=`${overlay}url("${v.replace(/"/g,'&quot;')}")`});
    qsa('[data-story]').forEach(el=>{const v=story[el.dataset.story];if(typeof v==='string')el.textContent=v});
  }catch{}
}
loadSiteContent();


let PRODUCTS=[],CONFIG={whatsapp:CONTACTS.whatsapp};const grid=document.querySelector('#product-grid'),count=document.querySelector('#product-count'),modal=document.querySelector('#product-modal'),modalContent=document.querySelector('#modal-content');
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function wa(number,text){const d=(number||'').replace(/\D/g,'');return d?`https://wa.me/${d}?text=${encodeURIComponent(text)}`:'#'}
function image(p,large=false){return p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}">`:`<div class="bottle ${large?'bottle-xl':'product-placeholder-bottle'}"><span>SCHIPANI</span><small>${esc(p.size)}</small></div>`}
function card(p){const msg=`Ciao, vorrei acquistare ${p.name} (${p.size}) al prezzo di € ${Number(p.price).toFixed(2)}. È disponibile?`;return `<article class="product-card"><button class="product-open" data-id="${p.id}" style="all:unset;display:block;cursor:pointer;width:100%"><div class="product-image">${image(p)}</div><div class="product-info"><h3>${esc(p.name)}</h3><span class="price">€ ${Number(p.price).toFixed(2).replace('.',',')}</span><p>${esc(p.size)}</p></div></button><a class="card-wa" target="_blank" rel="noopener" href="${wa(CONFIG.whatsapp,msg)}">◉ &nbsp;Richiedi ora</a></article>`}
async function init(){try{const pr=await fetch('/api/products');if(!pr.ok)throw 0;const pd=await pr.json();PRODUCTS=pd.products||[];render()}catch{grid.innerHTML='<p>Il catalogo sarà disponibile appena collegherai il database Cloudflare D1.</p>';count.textContent='Catalogo non collegato'}}
function render(){count.textContent=`${PRODUCTS.length} ${PRODUCTS.length===1?'prodotto':'prodotti'}`;grid.innerHTML=PRODUCTS.map(card).join('');grid.querySelectorAll('[data-id]').forEach(el=>el.addEventListener('click',()=>openProduct(el.dataset.id)))}
function openProduct(id){const p=PRODUCTS.find(x=>String(x.id)===String(id));if(!p)return;modalContent.innerHTML=`<div class="modal-product-image">${image(p,true)}</div><div class="modal-product-copy"><span class="eyebrow">Azienda Agricola Schipani</span><h2>${esc(p.name)}</h2><div class="modal-price">€ ${Number(p.price).toFixed(2).replace('.',',')}</div><p><strong>Formato:</strong> ${esc(p.size)}</p><p>${esc(p.description||'Olio extravergine d’oliva prodotto a Mesoraca.')}</p><a class="btn btn-primary" target="_blank" rel="noopener" href="${wa(CONFIG.whatsapp,`Ciao, vorrei acquistare ${p.name} (${p.size}) al prezzo di € ${Number(p.price).toFixed(2)}. È disponibile?`)}">Richiedi su WhatsApp →</a></div>`;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
document.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}));init();
