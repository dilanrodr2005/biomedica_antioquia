/* Estado, vistas (una función por módulo) y eventos. */
/* ---------- Estado ---------- */
const S={page:'dash',dq:'',dc:'',dr:'',dp:'',z:1,dg:30,av:1,per:'Trimestral',fc:{},fi:{},rep:'mant',sel:null};
const hoyS=()=>iso(HOY);
function alertas(){
  const h=hoyS(), g=iso(add(HOY,S.dg)), v=iso(add(HOY,S.av*365));
  return {mant:INV.filter(x=>x.pmant<h),gar:INV.filter(x=>x.fgar>=h&&x.fgar<=g),vida:INV.filter(x=>x.fvida<=v)};
}
const uniq=(a,k)=>[...new Set(a.map(x=>x[k]))].sort();
const sel=(id,lab,opts,val)=>`<label>${lab}<select id="${id}"><option value="">Todos</option>${opts.map(o=>`<option ${o===val?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;
const estTag=e=>`<span class="tag ${e==='Operativo'||e==='Vigente'?'ok':e==='En mantenimiento'||e==='En renovación'?'w':'r'}">${e}</span>`;
function table(cols,rows,click){
  return `<div class="tw"><table><thead><tr>${cols.map(c=>`<th>${c[1]}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr ${click?`class="click" data-i="${i}" tabindex="0"`:''}>${cols.map(c=>`<td>${c[2]?c[2](r[c[0]],r):esc(r[c[0]])}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="9">Sin resultados con estos filtros. Prueba quitar alguno.</td></tr>'}</tbody></table></div>`;
}
function csv(name,rows){
  if(!rows.length)return; const k=Object.keys(rows[0]);
  const t=[k.join(','),...rows.map(r=>k.map(c=>'"'+String(r[c]).replace(/"/g,'""')+'"').join(','))].join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob(['\ufeff'+t],{type:'text/csv'})); a.download=name; a.click();
}
function ficha(c){return `<div class="card ficha"><h3>${esc(c.equipo)} · ${esc(c.marca)} ${esc(c.modelo)}</h3><dl>
<dt>Servicio</dt><dd>${c.servicio}</dd><dt>Proveedor</dt><dd>${c.proveedor}</dd><dt>Registro INVIMA</dt><dd>${estTag(c.invima)}</dd>
<dt>Rango de precio</dt><dd>${fmt(c.pmin)} – ${fmt(c.pmax)} (actualizado ${c.fprecio})</dd><dt>Vida útil de referencia</dt><dd>${c.vida} años</dd>
<dt>Especificaciones</dt><dd>${esc(c.spec)}</dd><dt>Accesorios</dt><dd>${esc(c.acc)}</dd><dt>Fuente</dt><dd>Cotización / estudio de mercado de referencia</dd></dl></div>`}

/* ---------- Mapa SVG de subregiones ---------- */
const SUBS=[
['Urabá',[[-77.1,8.6],[-76.5,8.85],[-76.0,8.4],[-76.15,7.7],[-76.6,7.3],[-77.0,7.6]]],
['Bajo Cauca',[[-76.0,8.4],[-75.4,8.5],[-74.8,7.9],[-74.9,7.4],[-75.5,7.3],[-75.9,7.2],[-76.15,7.7]]],
['Occidente',[[-76.6,7.3],[-76.15,7.7],[-75.9,7.2],[-75.85,6.5],[-76.1,6.2],[-76.4,6.4]]],
['Norte',[[-75.9,7.2],[-75.5,7.3],[-75.2,7.0],[-75.25,6.6],[-75.45,6.5],[-75.7,6.5],[-75.85,6.5]]],
['Nordeste',[[-75.5,7.3],[-74.9,7.4],[-74.4,7.0],[-74.6,6.6],[-75.25,6.6],[-75.2,7.0]]],
['Magdalena Medio',[[-75.25,6.6],[-74.6,6.6],[-74.5,6.2],[-74.8,5.95],[-75.0,5.8],[-75.0,6.45]]],
['Valle de Aburrá',[[-75.7,6.5],[-75.45,6.5],[-75.45,6.1],[-75.7,6.05]]],
['Oriente',[[-75.45,6.5],[-75.25,6.6],[-75.0,6.45],[-75.0,5.8],[-75.45,5.7],[-75.45,6.1]]],
['Suroeste',[[-76.1,6.2],[-75.85,6.5],[-75.7,6.5],[-75.7,6.05],[-75.45,6.1],[-75.45,5.7],[-76.0,5.45],[-76.3,5.8]]]];
const VERDES=['#2f7d46','#1f5a30','#3f8f56','#174a27','#2a6e3f','#4a9a62','#215f33','#357f4b','#1b5230'];
function mapa(){
  let crit=0;ESE.forEach(e=>{const l=INV.filter(x=>x.ese===e.ese);if(l.filter(x=>x.estado!=='Operativo').length/l.length>.25)crit++});
  return `<div class="mapbox"><div id="lmap"></div><div id="maploading" class="maploading">Cargando mapa de Antioquia…</div>
  <div class="leg"><span class="d" style="background:var(--g)"></span>Subregión de Antioquia<br><span class="d" style="background:var(--w)"></span>ESE operando<br><span class="d" style="background:var(--r)"></span>ESE crítica (${crit})</div></div>`;
}
/* ---------- Mapa real: municipios de Antioquia (GeoJSON) agrupados por subregión ---------- */
const SUBR={
'Valle de Aburrá':['Medellín','Barbosa','Bello','Caldas','Copacabana','Envigado','Girardota','Itagüí','La Estrella','Sabaneta'],
'Bajo Cauca':['Cáceres','Caucasia','El Bagre','Nechí','Tarazá','Zaragoza'],
'Magdalena Medio':['Puerto Berrío','Puerto Nare','Puerto Triunfo','Yondó','Caracolí','Maceo'],
'Nordeste':['Amalfi','Anorí','Cisneros','Remedios','San Roque','Santo Domingo','Segovia','Vegachí','Yalí','Yolombó'],
'Norte':['Angostura','Belmira','Briceño','Campamento','Carolina','Carolina del Príncipe','Don Matías','Entrerríos','Gómez Plata','Guadalupe','Ituango','San Andrés','San Andrés de Cuerquia','San José de la Montaña','San Pedro','San Pedro de los Milagros','Santa Rosa de Osos','Toledo','Valdivia','Yarumal'],
'Occidente':['Abriaquí','Anzá','Armenia','Buriticá','Caicedo','Cañasgordas','Dabeiba','Ebéjico','Frontino','Giraldo','Heliconia','Liborina','Olaya','Peque','Sabanalarga','San Jerónimo','Santa Fe de Antioquia','Sopetrán','Uramita'],
'Oriente':['Abejorral','Alejandría','Argelia','El Carmen de Viboral','Cocorná','Concepción','El Peñol','Peñol','El Retiro','El Santuario','Santuario','Granada','Guarne','Guatapé','La Ceja','La Unión','Marinilla','Nariño','Rionegro','San Carlos','San Francisco','San Luis','San Rafael','San Vicente','Sonsón'],
'Suroeste':['Amagá','Andes','Angelópolis','Betania','Betulia','Caramanta','Ciudad Bolívar','Concordia','Fredonia','Hispania','Jardín','Jericó','La Pintada','Montebello','Pueblorrico','Salgar','Santa Bárbara','Tarso','Titiribí','Urrao','Valparaíso','Venecia','Támesis'],
'Urabá':['Apartadó','Arboletes','Carepa','Chigorodó','Murindó','Mutatá','Necoclí','San Juan de Urabá','San Pedro de Urabá','Turbo','Vigía del Fuerte']};
const SUBNAMES=Object.keys(SUBR);
const llave=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z ]/g,'').replace(/[N ]/g,'');
const SUBKEYS=[];SUBNAMES.forEach(n=>SUBR[n].forEach(m=>SUBKEYS.push([llave(m),n])));
function subDe(nombre){
  const k=llave(nombre); let e=SUBKEYS.find(x=>x[0]===k); if(e)return e[1];
  const p=SUBKEYS.filter(x=>k.startsWith(x[0])).sort((a,b)=>b[0].length-a[0].length); if(p.length)return p[0][1];
  const q=SUBKEYS.filter(x=>x[0].startsWith(k)); return q.length===1?q[0][1]:'';
}
const redondear=g=>{const r=a=>typeof a[0]==='number'?[+a[0].toFixed(3),+a[1].toFixed(3)]:a.map(r);return {type:g.type,coordinates:r(g.coordinates)}};
async function cargarAntioquia(){
  try{const c=localStorage.getItem('ant_mpio_v1');if(c)return JSON.parse(c)}catch(e){}
  for(const u of ['data/antioquia_municipios.json','https://raw.githubusercontent.com/santiblanko/colombia.geojson/master/mpio.json']){
    try{const r=await fetch(u);if(!r.ok)continue;const j=await r.json();
      const f=j.features.filter(x=>x.properties.DPTO==='05').map(x=>({n:x.properties.NOMBRE_MPI,s:subDe(x.properties.NOMBRE_MPI),g:redondear(x.geometry)}));
      if(f.length>100){try{localStorage.setItem('ant_mpio_v1',JSON.stringify(f))}catch(e){}return f}
    }catch(e){}
  }
  return null;
}
function initMap(){
  const el = document.getElementById('lmap'); 
  if(!el) return;
  
  if(typeof L === 'undefined'){
    el.innerHTML = '<p style="padding:20px;color:#5f6c64">El mapa necesita conexión a internet (Leaflet y OpenStreetMap).</p>';
    return;
  }
  
  const m = L.map(el, {scrollWheelZoom:false}).setView([6.9,-75.4], 7); 
  window._lm = m;

  // 1. CORREGIDO: Cambiamos a CartoDB para evitar el error 403
  // Usaren ti Esri World Street Map a kas normal a background nga awan ti API key
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong)'
  }).addTo(m);

  const ml = document.getElementById('maploading');
  
  const ese = () => ESE.forEach(e => {
    const l = INV.filter(x => x.ese === e.ese),
          f = l.filter(x => x.estado !== 'Operativo').length,
          c = f / l.length > .25;
    L.circleMarker([e.lat, e.lon], {
      radius: 6 + l.length / 4,
      color: '#fff',
      weight: 2,
      fillColor: c ? '#c0392b' : '#c9a227',
      fillOpacity: .95
    }).bindTooltip(`<b>${e.ese}</b><br>${e.mun} · ${l.length} equipos · ${f} no operativos`).addTo(m);
  });
  
  cargarAntioquia().then(f => {
    if(window._lm !== m) return; 
    if(ml) ml.remove();
    
    if(!f){
      SUBS.forEach((s, i) => L.polygon(s[1].map(p => [p[1], p[0]]), {
        color: '#065f46',
        weight: 1.5,
        fillColor: VERDES[i],
        fillOpacity: .35
      }).bindTooltip(s[0], {sticky: true}).addTo(m));
      ese();
      return;
    }
    
    const grupos = {};
    f.forEach(x => {
      const i = SUBNAMES.indexOf(x.s),
            col = i < 0 ? '#9aa5a0' : VERDES[i];
      const l = L.geoJSON({type: 'Feature', geometry: x.g}, {
        style: {color: '#fff', weight: .6, opacity: .8, fillColor: col, fillOpacity: .75}
      }).addTo(m);
      l.bindTooltip(`${x.n.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase())} · ${x.s || 'Sin subregión'}`, {sticky: true});
      (grupos[x.s] = grupos[x.s] || []).push(l);
    });
    
    const todo = L.featureGroup(Object.values(grupos).flat()); 
    m.fitBounds(todo.getBounds(), {padding: [6,6]});
    
    Object.entries(grupos).forEach(([n, ls]) => {
      if(!n) return;
      const c = L.featureGroup(ls).getBounds().getCenter();
      L.marker(c, {interactive: false, icon: L.divIcon({className: 'sublbl', html: n, iconSize: [0,0]})}).addTo(m);
    });
    
    ese();
  }).catch(err => {
    // 2. CORREGIDO: Si ocurre un error, lo registramos y quitamos el loader para que no se congele
    console.error("Error al cargar la capa de Antioquia:", err);
    if(ml) ml.remove();
  });
}

const ICON={
home:'<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h6"/>',
bell:'<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4"/>',
brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3M3 13h18"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-4 3-6 6.5-6s6.5 2 6.5 6M16 4.5a3.5 3.5 0 010 7M18 14c2.5.5 3.5 2.5 3.5 6"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'};
const ico=n=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;
const IMG='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/></svg>';
const AI={
 w:'<svg viewBox="0 0 32 32"><path d="M16 3L30 28H2z" fill="#1f5a30"/><path d="M16 12v8" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="24" r="1.8" fill="#fff"/></svg>',
 c:'<svg viewBox="0 0 32 32"><rect x="3" y="6" width="26" height="23" rx="3" fill="#c9a227"/><rect x="6" y="14" width="20" height="12" fill="#1f5a30"/><path d="M10 3v6M22 3v6" stroke="#1f5a30" stroke-width="2.5"/><path d="M9 17h3M15 17h3M21 17h2M9 22h3M15 22h3" stroke="#fff" stroke-width="2"/></svg>',
 h:'<svg viewBox="0 0 32 32"><path d="M8 3h16M8 29h16M10 3c0 8 6 8 6 13s-6 5-6 13M22 3c0 8-6 8-6 13s6 5 6 13" stroke="#1f5a30" stroke-width="2.5" fill="none"/><path d="M12 26c2-3 6-3 8 0z" fill="#c9a227"/></svg>'};
const RANGOS=[['Hasta $10 M',0,10e6],['$10 M – $30 M',10e6,30e6],['Más de $30 M',30e6,1e13]];
function dashCards(){
  const q=(S.dq||'').toLowerCase(), rg=S.dr?RANGOS[S.dr-1]:null;
  const r=CAT.filter(c=>(!S.dc||c.servicio===S.dc)&&(!S.dp||c.proveedor===S.dp)&&(!rg||(c.pmin>=rg[1]&&c.pmin<rg[2]))&&(!q||(c.equipo+c.marca+c.modelo+c.proveedor+c.servicio).toLowerCase().includes(q))).slice(0,6);
  S._dc=r;
  return r.map((c,i)=>`<div class="pc"><h4>${esc(c.equipo)}</h4><div class="row"><div class="ph">${IMG}</div><div class="tx"><b>${esc(c.marca+' '+c.modelo)}</b><span>INVIMA: ${c.invima}</span><span>${c.servicio}</span></div></div><button class="vf" data-f="${i}">Ver Ficha Técnica</button></div>`).join('')||'<p>Sin resultados. Quita algún filtro.</p>';
}
function acard(key,n,tit,icon,head,rows,dot){
  return `<div class="acard" data-go="rep:${key}" tabindex="0" role="link" aria-label="${tit}"><div class="hd"><span class="num">${n}</span><span class="tt">${tit}</span>${AI[icon]}</div>
  <div class="lst"><div><b>${head}</b></div>${rows.map(t=>`<div><span>${esc(t)}</span>${dot?'<i></i>':''}</div>`).join('')}</div></div>`;
}
function dash(){
  const a=alertas(), opt=(arr,lab,v)=>`<option value="">${lab}</option>`+arr.map(o=>`<option value="${o[0]}" ${String(o[0])===String(v)?'selected':''}>${esc(o[1])}</option>`).join('');
  return `<div class="sec" style="margin-top:0">Alertas Críticas de Inventario</div>
  <div class="agrid">
   ${acard('mant',a.mant.length,'Mantenimientos Vencidos','w','ESE – Equipo',a.mant.map(x=>x.ese+' – '+x.equipo))}
   ${acard('gar',a.gar.length,`Garantías por Expirar (${S.dg} días)`,'c','ESE – Equipo',a.gar.map(x=>x.ese+' – '+x.equipo))}
   ${acard('vida',a.vida.length,'Equipos Próximos a Fin de Vida Útil','h','Equipos Próximos',a.vida.map(x=>x.equipo+' – '+x.ese),true)}
  </div>
  <div class="dgrid"><div><div class="sec">Consultas Rápidas del Catálogo de Referencia</div>
   <div class="search"><svg class="l" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="q" placeholder="Buscar" aria-label="Buscar en el catálogo" value="${esc(S.dq)}"><button class="m" id="mic" aria-label="Buscar por voz"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg></button></div>
   <div class="pills"><select class="pill" id="dc" aria-label="Categoría">${opt(uniq(CAT,'servicio').map(x=>[x,x]),'Categoría (ej: Imagenología)',S.dc)}</select>
   <select class="pill" id="dr" aria-label="Rango de precios">${opt(RANGOS.map((r,i)=>[i+1,r[0]]),'Rango de Precios',S.dr)}</select>
   <select class="pill" id="dp" aria-label="Proveedor">${opt(uniq(CAT,'proveedor').map(x=>[x,x]),'Proveedor',S.dp)}</select></div>
   <div class="pgrid" id="cards">${dashCards()}</div></div>
   <div><div class="sec">Estado Operativo de Equipos por Subregión</div>${mapa()}</div></div>`;
}

function cat(){
  const f=S.fc, r=CAT.filter(c=>(!f.servicio||c.servicio===f.servicio)&&(!f.marca||c.marca===f.marca)&&(!f.invima||c.invima===f.invima)&&(!f.proveedor||c.proveedor===f.proveedor)&&(!f.pmax||c.pmin<=+f.pmax));
  S._cat=r;
  return `<div class="filters">${sel('servicio','Servicio',uniq(CAT,'servicio'),f.servicio)}${sel('marca','Marca',uniq(CAT,'marca'),f.marca)}${sel('invima','Estado registro INVIMA',uniq(CAT,'invima'),f.invima)}${sel('proveedor','Proveedor',uniq(CAT,'proveedor'),f.proveedor)}
  <label>Precio desde máx. (COP)<input id="pmax" type="number" step="1000000" placeholder="Ej: 20000000" value="${f.pmax||''}"></label></div>
  <p>${r.length} equipos · <button class="btn s" id="dl">Descargar CSV</button></p>
  ${table([['servicio','Servicio'],['equipo','Equipo'],['marca','Marca'],['modelo','Modelo'],['invima','INVIMA',estTag],['proveedor','Proveedor'],['pmin','Rango',(v,c)=>fmt(c.pmin)+' – '+fmt(c.pmax)]],r,true)}
  <p style="color:var(--mut);font-size:13px">Seleccione una fila para ver la ficha técnica.</p>
  <div id="fch">${S.sel!=null&&r[S.sel]?ficha(r[S.sel]):''}</div>
  <div class="note">Valores de referencia: no sustituyen los estudios de mercado ni los procesos de contratación.</div>`;
}
function inv(){
  const f=S.fi, r=INV.filter(x=>(!f.ese||x.ese===f.ese)&&(!f.estado||x.estado===f.estado)&&(!f.servicio||x.servicio===f.servicio));
  S._inv=r; const e=S.selI!=null&&r[S.selI];
  return `<div class="filters">${sel('ese','ESE',uniq(INV,'ese'),f.ese)}${sel('estado','Estado operativo',uniq(INV,'estado'),f.estado)}${sel('servicio','Servicio',uniq(INV,'servicio'),f.servicio)}</div>
  <p>${r.length} equipos</p>
  ${table([['id','ID'],['ese','ESE'],['equipo','Equipo'],['marca','Marca'],['estado','Estado',estTag],['pmant','Próx. mant.'],['fvida','Fin vida útil']],r,true)}
  ${e?`<div class="card" style="margin-top:14px"><h3>Hoja de vida · ${e.id} · ${esc(e.equipo)}</h3><div class="ficha"><dl>
  <dt>ESE</dt><dd>${e.ese} (${e.sub})</dd><dt>Marca / modelo</dt><dd>${e.marca} ${e.modelo}</dd><dt>Proveedor</dt><dd>${e.proveedor}</dd><dt>Estado</dt><dd>${estTag(e.estado)}</dd>
  <dt>Adquisición</dt><dd>${e.adq}</dd><dt>Fin de garantía</dt><dd>${e.fgar}</dd><dt>Último mantenimiento</dt><dd>${e.umant}</dd><dt>Próximo mantenimiento</dt><dd>${e.pmant}</dd><dt>Fin de vida útil</dt><dd>${e.fvida}</dd></dl></div></div>`:'<p style="color:var(--mut)">Seleccione un equipo para ver su hoja de vida.</p>'}`;
}
function rep(){
  const a=alertas(), m={mant:['Mantenimientos vencidos',a.mant,'pmant','Próx. mantenimiento'],gar:['Garantías por expirar',a.gar,'fgar','Fin de garantía'],vida:['Fin de vida útil',a.vida,'fvida','Fin de vida útil']}[S.rep];
  const cnt={};INV.forEach(x=>cnt[x.estado]=(cnt[x.estado]||0)+1);
  const sub={};INV.forEach(x=>sub[x.sub]=(sub[x.sub]||0)+1);const mx=Math.max(...Object.values(sub));
  return `<div class="tabs">${Object.entries({mant:'Mantenimientos',gar:'Garantías',vida:'Vida útil'}).map(([k,v])=>`<button class="btn ${S.rep===k?'':'s'}" data-rep="${k}">${v} (${a[k].length})</button>`).join('')}</div>
  <div class="card"><h3>${m[0]}</h3>${table([['id','ID'],['ese','ESE'],['equipo','Equipo'],[m[2],m[3]]],m[1])}<p><button class="btn s" id="dl">Descargar CSV</button></p></div>
  <div class="grid g2" style="margin-top:14px"><div class="card"><h3>Estado operativo</h3>${Object.entries(cnt).map(([k,v])=>`<div>${k}: <b>${v}</b> (${Math.round(v/INV.length*100)}%)<div class="bar"><i style="width:${v/INV.length*100}%;background:${k==='Operativo'?'var(--g)':k==='En mantenimiento'?'var(--w)':'var(--r)'}"></i></div></div>`).join('<br>')}</div>
  <div class="card"><h3>Equipos por subregión</h3>${Object.entries(sub).sort((x,y)=>y[1]-x[1]).map(([k,v])=>`<div>${k}: <b>${v}</b><div class="bar"><i style="width:${v/mx*100}%"></i></div></div>`).join('')}</div></div>`;
}
function ese(){
  const pr={Baja:'Alta',Media:'Media',Alta:'Baja'}, ord={Alta:0,Media:1,Baja:2};
  const r=ESE.map(e=>{const l=INV.filter(x=>x.ese===e.ese);return {...e,n:l.length,no:l.filter(x=>x.estado!=='Operativo').length,pri:pr[e.cap]}}).sort((a,b)=>ord[a.pri]-ord[b.pri]);
  return `<p>Caracterización de las ESE según su capacidad de gestión tecnológica. Las de capacidad baja (municipios dispersos) se priorizan para acompañamiento técnico.</p>
  ${table([['ese','ESE'],['sub','Subregión'],['mun','Municipio'],['cap','Capacidad'],['n','Equipos'],['no','No operativos'],['pri','Prioridad de acompañamiento',v=>`<span class="tag ${v==='Alta'?'r':v==='Media'?'w':'ok'}">${v}</span>`]],r)}`;
}
function prov(){
  const m={};CAT.forEach(c=>{(m[c.proveedor]=m[c.proveedor]||{proveedor:c.proveedor,n:0,marcas:new Set(),serv:new Set()});const p=m[c.proveedor];p.n++;p.marcas.add(c.marca);p.serv.add(c.servicio)});
  const r=Object.values(m).map(p=>({...p,marcas:[...p.marcas].join(', '),serv:[...p.serv].join(', ')}));
  return table([['proveedor','Proveedor'],['n','Equipos en catálogo'],['marcas','Marcas'],['serv','Servicios']],r);
}
function cfg(){
  return `<div class="card" style="max-width:520px"><h3>Parámetros de alertas</h3><div class="filters" style="flex-direction:column">
  <label>Días de anticipación para alerta de garantía<input id="dg" type="number" min="7" max="120" value="${S.dg}"></label>
  <label>Años de anticipación para fin de vida útil<input id="av" type="number" min="0.5" max="3" step="0.5" value="${S.av}"></label>
  <label>Periodicidad de actualización de precios<select id="per">${['Mensual','Trimestral','Semestral'].map(o=>`<option ${o===S.per?'selected':''}>${o}</option>`).join('')}</select></label></div>
  <p style="color:var(--mut);font-size:13px">Los cambios se aplican de inmediato en el Dashboard y en Reportes. En este piloto no se guardan al cerrar la página.</p></div>`;
}

/* ---------- Render y eventos ---------- */
const MENU=[['dash','Inicio','(Dashboard)','home'],['cat','Catálogo de Referencia','(Planeación)','grid'],['inv','Inventario de ESEs','(Seguimiento)','clip'],['rep','Reportes y Alertas','','bell'],['ese','Gestión de ESEs','','brief'],['prov','Proveedores','','users'],['cfg','Configuración','','gear']];
const VIEW={dash,cat,inv,rep,ese,prov,cfg};
const TIT={dash:'Tablero de Control y Alertas',cat:'Catálogo de Referencia Técnica y Económica',inv:'Inventario Departamental y Hoja de Vida',rep:'Reportes y Alertas',ese:'Gestión de ESEs',prov:'Proveedores Identificados',cfg:'Configuración'};
function go(p){S.page=p;render();document.getElementById('main').scrollTop=0}
function showFicha(c){document.getElementById('mbody').innerHTML=ficha(c);document.getElementById('modal').hidden=false;document.getElementById('mclose').focus()}
function render(){
  document.getElementById('menu').innerHTML=MENU.map(([k,t,s,ic])=>`<button data-p="${k}" class="${S.page===k?'on':''}" ${S.page===k?'aria-current="page"':''}><span class="ic">${ico(ic)}</span><span class="lb">${t}${s?`<small>${s}</small>`:''}</span></button>`).join('');
  if(window._lm){window._lm.remove();window._lm=null}
  const m=MENU.find(x=>x[0]===S.page);
  document.getElementById('main').innerHTML=`<div class="crumb">${m[1]} ${m[2]}</div><h1>${TIT[S.page]}</h1>`+VIEW[S.page]();
  document.getElementById('nbell').textContent=alertas().mant.length;
  bind();
}
function bindCards(){document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>showFicha(S._dc[+b.dataset.f]))}
function bind(){
  const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
  $$('[data-go]').forEach(e=>{const f=()=>{const[p,r]=e.dataset.go.split(':');if(r)S.rep=r;go(p)};e.onclick=f;e.onkeydown=ev=>ev.key==='Enter'&&f()});
  $$('[data-rep]').forEach(b=>b.onclick=()=>{S.rep=b.dataset.rep;render()});
  const keep=(id)=>{const el=document.getElementById(id);el&&el.focus();};
  if(S.page==='dash'){
    const upd=()=>{$('#cards').innerHTML=dashCards();bindCards()};
    $('#q').oninput=e=>{S.dq=e.target.value;upd()};
    ['dc','dr','dp'].forEach(id=>$('#'+id).onchange=e=>{S[id]=e.target.value;upd()});
    bindCards();
    initMap();
    $('#mic').onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return alert('Tu navegador no soporta búsqueda por voz.');
      const r=new SR();r.lang='es-CO';r.onresult=e=>{S.dq=e.results[0][0].transcript;render()};r.start()};
  }
  if(S.page==='cat'){['servicio','marca','invima','proveedor','pmax'].forEach(id=>{$('#'+id).onchange=e=>{S.fc[id]=e.target.value;S.sel=null;render()}});
    $$('tr.click').forEach(tr=>{const f=()=>{S.sel=+tr.dataset.i;render();document.getElementById('fch').scrollIntoView({behavior:'smooth',block:'nearest'})};tr.onclick=f;tr.onkeydown=e=>e.key==='Enter'&&f()});
    $('#dl').onclick=()=>csv('catalogo.csv',S._cat)}
  if(S.page==='inv'){['ese','estado','servicio'].forEach(id=>{$('#'+id).onchange=e=>{S.fi[id]=e.target.value;S.selI=null;render()}});
    $$('tr.click').forEach(tr=>{const f=()=>{S.selI=+tr.dataset.i;render()};tr.onclick=f;tr.onkeydown=e=>e.key==='Enter'&&f()})}
  if(S.page==='rep'){$('#dl').onclick=()=>{const a=alertas();csv(S.rep+'.csv',a[S.rep])}}
  if(S.page==='cfg'){$('#dg').onchange=e=>{S.dg=Math.min(120,Math.max(7,+e.target.value||30));render()};$('#av').onchange=e=>{S.av=Math.min(3,Math.max(.5,+e.target.value||1));render()};$('#per').onchange=e=>{S.per=e.target.value}}
  document.querySelectorAll('#side [data-p]').forEach(b=>b.onclick=()=>go(b.dataset.p));
}
document.getElementById('collapse').onclick=()=>document.getElementById('side').classList.toggle('col');
document.getElementById('bell').onclick=()=>{S.rep='mant';go('rep')};
document.getElementById('mclose').onclick=()=>document.getElementById('modal').hidden=true;
document.getElementById('modal').onclick=e=>{if(e.target.id==='modal')e.target.hidden=true};
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('modal').hidden=true});
render();
