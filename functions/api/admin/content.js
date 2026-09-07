const DEFAULT_CONTENT = {
  images: {
    logo: '/assets/logo-schipani.jpg',
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

export async function onRequestGet({env}){
  let saved=null;
  try{
    const row=await env.DB.prepare("SELECT value FROM settings WHERE key='site_content'").first();
    if(row?.value) saved=JSON.parse(row.value);
  }catch{}
  const content=merge(DEFAULT_CONTENT,saved||{});
  return json({content});
}
function merge(base,extra){
  return {images:{...base.images,...(extra.images||{})},story:{...base.story,...(extra.story||{})}};
}
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
