const loginView=document.querySelector('#login-view'), adminView=document.querySelector('#admin-view'), loginForm=document.querySelector('#login-form'), loginError=document.querySelector('#login-error'), list=document.querySelector('#admin-product-list'), count=document.querySelector('#admin-count'), modal=document.querySelector('#admin-modal'), form=document.querySelector('#product-form'), delBtn=document.querySelector('#delete-product-btn'), statusEl=document.querySelector('#product-form-status');let PRODUCTS=[];
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function api(url,opts={}){const r=await fetch(url,opts);if(r.status===401){showLogin();throw new Error('Non autorizzato')}let d={};try{d=await r.json()}catch{}if(!r.ok)throw new Error(d.error||'Errore');return d}
function showLogin(){loginView.hidden=false;adminView.hidden=true}function showAdmin(){loginView.hidden=true;adminView.hidden=false;loadProducts();loadContent()}
async function check(){try{await api('/api/admin/session');showAdmin()}catch{showLogin()}}check();
loginForm.addEventListener('submit',async e=>{e.preventDefault();loginError.textContent='';try{await api('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.querySelector('#admin-password').value})});showAdmin()}catch(err){loginError.textContent=err.message}});
document.querySelector('#logout-btn').addEventListener('click',async()=>{try{await fetch('/api/admin/logout',{method:'POST'})}finally{showLogin()}});
async function loadProducts(){try{const d=await api('/api/admin/products');PRODUCTS=d.products||[];render()}catch(e){list.innerHTML=`<p>${esc(e.message)}</p>`}}
function render(){count.textContent=PRODUCTS.filter(p=>p.active).length;list.innerHTML=PRODUCTS.map(p=>`<div class="admin-product-row"><div class="admin-thumb">${p.image_url?`<img src="${esc(p.image_url)}" alt="">`:'OLIO'}</div><div><h3>${esc(p.name)}</h3><p>${esc(p.size)} · € ${Number(p.price).toFixed(2).replace('.',',')}</p></div><span class="status-pill ${p.active?'':'off'}">${p.active?'Online':'Nascosto'}</span><button class="edit-btn" data-edit="${p.id}">Modifica</button></div>`).join('')||'<p>Nessun prodotto.</p>';list.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openModal(PRODUCTS.find(p=>String(p.id)===b.dataset.edit))))}
function openModal(p=null){form.reset();statusEl.textContent='';document.querySelector('#product-id').value=p?.id||'';document.querySelector('#product-name').value=p?.name||'';document.querySelector('#product-size').value=p?.size||'';document.querySelector('#product-price').value=p?.price??'';document.querySelector('#product-description').value=p?.description||'';document.querySelector('#product-active').checked=p?!!p.active:true;document.querySelector('#admin-modal-title').textContent=p?'Modifica prodotto':'Nuovo prodotto';delBtn.hidden=!p;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
document.querySelector('#new-product-btn').addEventListener('click',()=>openModal());document.querySelectorAll('[data-admin-close]').forEach(x=>x.addEventListener('click',closeModal));
form.addEventListener('submit',async e=>{e.preventDefault();statusEl.textContent='Salvataggio…';try{let imageUrl=null;const file=document.querySelector('#product-image').files[0];if(file){const fd=new FormData();fd.append('file',file);const up=await api('/api/admin/upload',{method:'POST',body:fd});imageUrl=up.url}const id=document.querySelector('#product-id').value;const old=PRODUCTS.find(p=>String(p.id)===String(id));const body={name:document.querySelector('#product-name').value.trim(),size:document.querySelector('#product-size').value.trim(),price:Number(document.querySelector('#product-price').value),description:document.querySelector('#product-description').value.trim(),active:document.querySelector('#product-active').checked,image_url:imageUrl||old?.image_url||null};await api(id?`/api/admin/products/${id}`:'/api/admin/products',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});statusEl.textContent='Salvato.';await loadProducts();setTimeout(closeModal,500)}catch(err){statusEl.textContent=err.message}});
delBtn.addEventListener('click',async()=>{const id=document.querySelector('#product-id').value;if(!id||!confirm('Eliminare definitivamente questo prodotto?'))return;try{await api(`/api/admin/products/${id}`,{method:'DELETE'});await loadProducts();closeModal()}catch(err){statusEl.textContent=err.message}});

// Gestione immagini e storia
let SITE_CONTENT={images:{},story:{}};
const IMAGE_FIELDS=[
  ['logo','Logo aziendale','Usato nell’header e nel footer di tutte le pagine.','image'],
  ['home_hero','Home · Immagine principale','Grande foto di apertura della Home.','background'],
  ['home_story_left','Home · Foto storia sinistra','Foto uliveto nella sezione “La nostra storia”.','background'],
  ['home_story_right','Home · Foto olio destra','Foto laterale nella sezione “La nostra storia”.','background'],
  ['values_background','Home · Sfondo valori','Sfondo della fascia con territorio, qualità e tradizione.','background'],
  ['story_left','Storia · Foto sinistra','Foto nella parte finale della pagina “La nostra storia”.','background'],
  ['story_right','Storia · Foto destra','Foto laterale nella parte finale della pagina “La nostra storia”.','background']
];
const STORY_GROUPS=[
  ['Home · Anteprima storia',[['home_title','Titolo','input'],['home_p1','Primo paragrafo','textarea'],['home_p2','Secondo paragrafo','textarea']]],
  ['Pagina Storia · Apertura',[['page_kicker','Sopratitolo','input'],['page_title','Titolo principale','textarea'],['page_intro','Introduzione','textarea'],['years','Anni / numero evidenza','input'],['years_text','Testo sotto gli anni','textarea']]],
  ['Pagina Storia · Le origini',[['origins_kicker','Sopratitolo','input'],['origins_title','Titolo','textarea'],['origins_p1','Paragrafo 1','textarea'],['origins_p2','Paragrafo 2','textarea'],['origins_p3','Paragrafo 3','textarea']]],
  ['Pagina Storia · Il presente',[['present_kicker','Sopratitolo','input'],['present_title','Titolo','textarea'],['present_text','Testo','textarea']]]
];

document.querySelectorAll('[data-admin-tab]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-admin-tab]').forEach(x=>x.classList.toggle('active',x===btn));
  document.querySelectorAll('[data-admin-panel]').forEach(x=>x.classList.toggle('active',x.dataset.adminPanel===btn.dataset.adminTab));
}));

async function loadContent(){
  try{const d=await api('/api/admin/content');SITE_CONTENT=d.content||{images:{},story:{}};renderContentAdmin()}catch(err){
    const im=document.querySelector('#images-status'); if(im) im.textContent=err.message;
  }
}
function renderContentAdmin(){
  const grid=document.querySelector('#images-grid');
  if(grid)grid.innerHTML=IMAGE_FIELDS.map(([key,label,desc,type])=>{
    const url=SITE_CONTENT.images?.[key]||'';
    const preview=type==='image'?`<div class="image-admin-preview"><img src="${esc(url)}" alt=""></div>`:`<div class="image-admin-preview" style="background-image:url('${esc(url)}')"></div>`;
    return `<article class="image-admin-card">${preview}<div class="image-admin-body"><h3>${esc(label)}</h3><p>${esc(desc)}</p><div class="form-field"><label>Sostituisci immagine</label><input type="file" data-image-upload="${key}" accept="image/png,image/jpeg,image/webp"></div><div class="image-current">Immagine attuale: ${esc(url||'nessuna')}</div></div></article>`
  }).join('');
  const story=document.querySelector('#story-fields');
  if(story)story.innerHTML=STORY_GROUPS.map(([title,fields])=>`<section class="story-admin-block ${fields.length>3?'full':''}"><h3>${esc(title)}</h3>${fields.map(([key,label,type])=>`<div class="form-field"><label>${esc(label)}</label>${type==='textarea'?`<textarea data-story-input="${key}" rows="4">${esc(SITE_CONTENT.story?.[key]||'')}</textarea>`:`<input data-story-input="${key}" value="${esc(SITE_CONTENT.story?.[key]||'')}">`}</div>`).join('')}</section>`).join('');
}

const imagesForm=document.querySelector('#images-form');
if(imagesForm)imagesForm.addEventListener('submit',async e=>{
  e.preventDefault(); const status=document.querySelector('#images-status'); status.textContent='Caricamento e salvataggio…';
  try{
    const next={...(SITE_CONTENT.images||{})};
    for(const input of document.querySelectorAll('[data-image-upload]')){
      const file=input.files?.[0]; if(!file)continue;
      const fd=new FormData();fd.append('file',file);fd.append('folder','site');
      const up=await api('/api/admin/upload',{method:'POST',body:fd});next[input.dataset.imageUpload]=up.url;
    }
    const d=await api('/api/admin/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:{images:next}})});
    SITE_CONTENT=d.content;renderContentAdmin();status.textContent='Immagini salvate. Le modifiche sono già online.';
  }catch(err){status.textContent=err.message}
});
const storyForm=document.querySelector('#story-form');
if(storyForm)storyForm.addEventListener('submit',async e=>{
  e.preventDefault();const status=document.querySelector('#story-status');status.textContent='Salvataggio…';
  try{
    const story={...(SITE_CONTENT.story||{})};document.querySelectorAll('[data-story-input]').forEach(el=>story[el.dataset.storyInput]=el.value.trim());
    const d=await api('/api/admin/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:{story}})});
    SITE_CONTENT=d.content;status.textContent='Storia salvata. Le modifiche sono già online.';
  }catch(err){status.textContent=err.message}
});
