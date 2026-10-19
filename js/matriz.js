/* Módulo "Matriz de Dotación": el formulador marca, en cualquier orden, las alternativas (marcas, modelos o
   proveedores) de los equipos que necesita; el sistema agrupa por equipo y llena la matriz oficial de Excel. */
(function () {
const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
const llave = c => c.equipo + '|' + c.marca + '|' + c.modelo;
const byKey = k => CAT.find(c => llave(c) === k);
const precioRef = c => Math.round((c.pmin + c.pmax) / 2 / 1e4) * 1e4;
const grupo = n => GRUPOS.find(g => g.equipo === n);
const norm = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const M = { ese: { nombre: '', nit: '', departamento: 'ANTIOQUIA', municipio: '', nivel: '', caracter: '', plazo: '', sedes: '', proyecto: '', pgn: '', otros: '' },
  sel: [], cfg: {}, pr: {}, q: '', serv: '', msg: '', ok: '' };
const CARACTER = ['HOSPITAL MUNICIPAL', 'HOSPITAL REGIONAL', 'HOSPITAL DEPARTAMENTAL', 'CENTRO DE SALUD', 'PUESTO DE SALUD'];
const cfgOf = eq => M.cfg[eq] || (M.cfg[eq] = { cant: 1, ambiente: '', sede: '', estado: '', referencia: '', justif: '' });
const selDe = eq => M.sel.filter(k => { const c = byKey(k); return c && c.equipo === eq });
const equipos = () => { const o = []; M.sel.forEach(k => { const c = byKey(k); if (c && !o.includes(c.equipo)) o.push(c.equipo) }); return o };
const precio = k => +(M.pr[k] != null && M.pr[k] !== '' ? M.pr[k] : precioRef(byKey(k)));
const rot = p => p === 0 ? 'Estudio No. 1' : p === 1 ? 'Estudio No. 2' : 'Hoja Comparativo';

/* ---- 1. Selector libre: todo el catálogo, con búsqueda ---- */
function listaHtml() {
  const q = norm(M.q);
  const gs = GRUPOS.filter(g => !M.serv || g.servicio === M.serv).map(g => [g, CAT.filter(c => c.equipo === g.equipo && (!q || norm(c.equipo + ' ' + c.marca + ' ' + c.modelo + ' ' + c.proveedor + ' ' + c.servicio).includes(q)))]).filter(x => x[1].length);
  if (!gs.length) return '<p style="color:var(--mut)">Ningún equipo coincide con la búsqueda.</p>';
  return gs.map(([g, ms]) => { const todas = ms.every(c => M.sel.includes(llave(c)));
    return `<div class="card" style="margin-bottom:10px;padding:10px 14px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><div><b>${esc(g.equipo)}</b> <span style="color:var(--mut)">· ${esc(g.servicio)}</span></div>
    <button class="btn s" data-all="${esc(g.equipo)}">${todas ? 'Quitar todas' : 'Elegir las ' + ms.length}</button></div>
    ${ms.map(c => { const k = llave(c); return `<label style="display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-top:1px solid var(--bd);cursor:pointer"><input type="checkbox" data-pick="${esc(k)}" ${M.sel.includes(k) ? 'checked' : ''} style="margin-top:4px">
     <span style="flex:1"><b>${esc(c.marca)} ${esc(c.modelo)}</b> · ${esc(c.proveedor)} ${estTag(c.invima)} · garantía ${c.gar} ${c.gar > 1 ? 'años' : 'año'} · ${fmt(precioRef(c))}<br><small style="color:var(--mut)">${esc(c.spec)}</small></span></label>` }).join('')}</div>` }).join('');
}
function refreshList() {
  const el = $('#m_list'); el.innerHTML = listaHtml();
  $$('#m_list [data-pick]').forEach(b => b.onchange = () => { const k = b.dataset.pick; M.sel = b.checked ? M.sel.concat(k) : M.sel.filter(x => x !== k); refreshSel(); });
  $$('#m_list [data-all]').forEach(b => b.onclick = () => { const eq = b.dataset.all, q = norm(M.q), ks = CAT.filter(c => c.equipo === eq && (!q || norm(c.equipo + ' ' + c.marca + ' ' + c.modelo + ' ' + c.proveedor + ' ' + c.servicio).includes(q))).map(llave);
    M.sel = ks.every(k => M.sel.includes(k)) ? M.sel.filter(k => !ks.includes(k)) : M.sel.concat(ks.filter(k => !M.sel.includes(k))); refreshSel(); });
}

/* ---- 2. Equipos elegidos: se agrupan solos, en el orden en que se marcaron ---- */
function selHtml() {
  const eqs = equipos();
  if (!eqs.length) return '<div class="note">Aún no ha elegido nada. Marque arriba las alternativas que quiere comparar; los equipos se agrupan solos y puede elegirlos en el orden que prefiera.</div>';
  return `<p style="margin:0 0 8px"><b>${M.sel.length}</b> alternativas en <b>${eqs.length}</b> ${eqs.length > 1 ? 'equipos' : 'equipo'}.</p>` + eqs.map((eq, n) => {
    const g = grupo(eq), c = cfgOf(eq), ks = selDe(eq), falta = ks.length < 2;
    const tot = ks.slice(0, 2).map(k => precio(k) * c.cant), menor = tot.length ? Math.min(...tot) : 0;
    return `<div class="card" style="margin-top:12px;${falta ? 'border-left:5px solid var(--r)' : ''}"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h3 style="margin:0">${n + 1}. ${esc(eq)} <span style="color:var(--mut);font-weight:400">· ${esc(g.servicio)}</span></h3><button class="btn s" data-rmg="${esc(eq)}">Quitar equipo</button></div>
    ${falta ? '<p style="color:var(--r);margin:6px 0 0">Falta al menos una alternativa más de este equipo para poder compararlo.</p>' : ''}
    <div class="filters"><label>Cantidad total<input type="number" min="1" step="1" data-eq="${esc(eq)}" data-k="cant" value="${c.cant}"></label>
    <label>Ambiente y/o área<input data-eq="${esc(eq)}" data-k="ambiente" value="${esc(c.ambiente)}" placeholder="Ej: Consultorio 2"></label>
    <label>Sede<input data-eq="${esc(eq)}" data-k="sede" value="${esc(c.sede)}" placeholder="Ej: Hospital principal"></label></div>
    <div class="tw"><table><thead><tr><th>Orden</th><th>Alternativa</th><th>Proveedor</th><th>Precio unitario IVA incl.<br><small>referencia del catálogo</small></th><th>Va a</th><th></th></tr></thead><tbody>
    ${ks.map((k, i) => { const x = byKey(k); return `<tr><td style="white-space:nowrap"><button class="btn s" data-mv="${esc(k)}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button> <button class="btn s" data-mv="${esc(k)}" data-d="1" ${i === ks.length - 1 ? 'disabled' : ''} aria-label="Bajar">↓</button></td>
     <td><b>${esc(x.marca)}</b> ${esc(x.modelo)}</td><td>${esc(x.proveedor)}</td><td><input type="number" min="0" step="10000" style="width:130px" data-pr="${esc(k)}" value="${precio(k)}"></td>
     <td><span class="tag ${i < 2 ? 'ok' : 'w'}">${rot(i)}</span></td><td><button class="btn s" data-rm="${esc(k)}" aria-label="Quitar">✕</button></td></tr>` }).join('')}</tbody></table></div>
    ${!falta ? `<p style="margin:6px 0 0;font-size:13px;color:var(--mut)">Valor menor cotizado entre los estudios 1 y 2 (× ${c.cant}): <b>${fmt(menor)}</b></p>` : ''}
    <div class="filters" style="margin-top:8px"><label>Estado actual de la dotación<select data-eq="${esc(eq)}" data-k="estado"><option value="">(sin definir)</option>${XlsxFill.ESTADOS.map(o => `<option value="${esc(o)}" ${o === c.estado ? 'selected' : ''}>${esc(o.trim())}</option>`).join('')}</select></label>
    <label>Referencia de la necesidad<select data-eq="${esc(eq)}" data-k="referencia"><option value="">(sin definir)</option>${XlsxFill.REFERENCIAS.map(o => `<option value="${esc(o)}" ${o === c.referencia ? 'selected' : ''}>${esc(o.trim())}</option>`).join('')}</select></label>
    <label style="flex:1;min-width:260px">Justificación del equipo solicitado<textarea rows="2" data-eq="${esc(eq)}" data-k="justif" placeholder="Diagnóstico y justificación de la necesidad" style="width:100%;font:inherit">${esc(c.justif)}</textarea></label></div></div>` }).join('');
}
function refreshSel() {
  $('#m_sel').innerHTML = selHtml();
  $$('#m_sel [data-k]').forEach(el => { const f = () => { const c = cfgOf(el.dataset.eq), k = el.dataset.k; c[k] = k === 'cant' ? Math.max(1, Math.floor(+el.value) || 1) : el.value };
    el.oninput = f; el.onchange = () => { f(); if (el.dataset.k === 'cant') refreshSel() } });
  $$('#m_sel [data-pr]').forEach(el => { el.oninput = () => { M.pr[el.dataset.pr] = el.value }; el.onchange = refreshSel });
  $$('#m_sel [data-rm]').forEach(b => b.onclick = () => { M.sel = M.sel.filter(k => k !== b.dataset.rm); refreshSel() });
  $$('#m_sel [data-rmg]').forEach(b => b.onclick = () => { const ks = selDe(b.dataset.rmg); M.sel = M.sel.filter(k => !ks.includes(k)); refreshSel() });
  $$('#m_sel [data-mv]').forEach(b => b.onclick = () => { const k = b.dataset.mv, eq = byKey(k).equipo, ks = selDe(eq), i = ks.indexOf(k), j = i + +b.dataset.d; if (j < 0 || j >= ks.length) return;
    [ks[i], ks[j]] = [ks[j], ks[i]]; let n = 0; M.sel = M.sel.map(x => { const c = byKey(x); return c && c.equipo === eq ? ks[n++] : x }); refreshSel() });
  refreshList();
}

/* ---- Pantalla ---- */
function mat() {
  if (window.matPreset) { const eq = window.matPreset; window.matPreset = null; if (grupo(eq)) { M.sel = M.sel.filter(k => byKey(k) && byKey(k).equipo !== eq).concat(CAT.filter(c => c.equipo === eq).map(llave)); M.q = ''; M.serv = '' } }
  const e = M.ese, f = (k, l, t = 'text', x = '') => `<label>${l}<input data-e="${k}" type="${t}" value="${esc(e[k])}" ${x}></label>`;
  return `<p>Elija los equipos y las alternativas que desea comparar, <b>en el orden que quiera</b>; el sistema llena la <b>Matriz de Dotación Biomédica 2025 (v3.0)</b> con las especificaciones, proveedores, marcas y precios, y la descarga en Excel con el formato oficial. Es lo mismo que contendría el estudio de mercado.</p>
  <div class="sec">1. Elija las alternativas de cada equipo</div>
  <div class="filters"><label style="flex:1;min-width:240px">Buscar equipo, marca, modelo o proveedor<input id="m_q" type="search" value="${esc(M.q)}" placeholder="Ej: ecógrafo, Mindray, MedTech"></label>
  <label>Servicio<select id="m_serv"><option value="">Todos</option>${uniq(CAT, 'servicio').map(s => `<option ${s === M.serv ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label></div>
  <div id="m_list" style="max-height:440px;overflow:auto;padding-right:4px"></div>
  <div class="sec">2. Revise y complete cada equipo</div><div id="m_sel"></div>
  <div class="sec">3. Datos de la ESE y del proyecto</div>
  <div class="card"><datalist id="dl_ese">${ESE.map(x => `<option value="${esc(x.ese)}">`).join('')}</datalist>
  <div class="filters"><label>Nombre de la ESE<input data-e="nombre" list="dl_ese" value="${esc(e.nombre)}" placeholder="Escriba o elija"></label>${f('nit', 'NIT de la ESE')}${f('departamento', 'Departamento')}${f('municipio', 'Municipio')}
  <label>Carácter territorial<input data-e="caracter" list="dl_car" value="${esc(e.caracter)}"><datalist id="dl_car">${CARACTER.map(x => `<option value="${x}">`).join('')}</datalist></label>${f('nivel', 'Nivel de atención', 'number', 'min="1" max="3"')}${f('plazo', 'Plazo de ejecución (meses)', 'number', 'min="1"')}
  ${f('pgn', 'Valor recursos PGN - MSPS (COP)', 'number', 'min="0"')}${f('otros', 'Valor otros recursos (COP)', 'number', 'min="0"')}
  <label style="flex:1;min-width:260px">Sede o sedes<input data-e="sedes" value="${esc(e.sedes)}"></label><label style="flex:1;min-width:260px">Nombre del proyecto<input data-e="proyecto" value="${esc(e.proyecto)}"></label></div></div>
  <div style="margin:14px 0"><button class="btn" id="m_go">Llenar matriz y descargar Excel</button></div><div id="m_fb"></div>
  <div class="note">Los precios y especificaciones del catálogo son de referencia: reemplace los precios por los de sus cotizaciones. La matriz oficial compara dos estudios de mercado por equipo: las dos primeras alternativas (según el orden que defina con ↑ ↓) van a los estudios No. 1 y No. 2 y las demás a la hoja Comparativo. Las columnas FOLIO quedan vacías para anotar la página de cada cotización.</div>`;
}
function bindMat() {
  $$('[data-e]').forEach(el => el.oninput = () => { M.ese[el.dataset.e] = el.value;
    if (el.dataset.e === 'nombre') { const x = ESE.find(s => s.ese === el.value); if (x) { M.ese.municipio = x.mun; const m = $('[data-e=municipio]'); if (m) m.value = x.mun } } });
  $('#m_q').oninput = e => { M.q = e.target.value; refreshList() };
  $('#m_serv').onchange = e => { M.serv = e.target.value; refreshList() };
  $('#m_go').onclick = descargar;
  refreshSel(); feedback();
}
function feedback() { const el = $('#m_fb'); if (!el) return; el.innerHTML = M.msg ? `<div class="note" id="m_msg" style="border-color:var(--r)">${M.msg}</div>` : M.ok ? `<div class="note" id="m_msg">${M.ok}</div>` : '' }
async function descargar() {
  M.msg = ''; M.ok = '';
  try {
    if (typeof JSZip === 'undefined') throw new Error('No se pudo cargar la librería JSZip (requiere conexión a internet).');
    const eqs = equipos(); if (!eqs.length) throw new Error('Elija al menos un equipo con 2 o más alternativas.');
    eqs.forEach(eq => { if (selDe(eq).length < 2) throw new Error(eq + ': elija al menos 2 alternativas para compararlo (o quite el equipo).');
      selDe(eq).forEach(k => { if (!(precio(k) > 0)) throw new Error(eq + ': indique un precio mayor que cero para ' + byKey(k).marca + ' ' + byKey(k).modelo + '.') }) });
    const items = eqs.map(eq => { const g = grupo(eq), c = cfgOf(eq);
      return { servicio: g.servicio, ambiente: c.ambiente, sede: c.sede, cant: c.cant, equipo: g.equipo, req: g.req, acc: g.acc, vida: g.vida, estado: c.estado, referencia: c.referencia, justif: c.justif,
        alts: selDe(eq).map(k => { const x = byKey(k); return { proveedor: x.proveedor, marca: x.marca, modelo: x.modelo, invima: x.invima, gar: x.gar, val: x.val, precio: precio(k) } }) } });
    const bytes = await XlsxFill.llenarMatriz(JSZip, PLANTILLA_B64, { ese: M.ese, items });
    const nom = 'Matriz_de_Dotacion_' + ((M.ese.nombre || 'ESE').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '')) + '_' + iso(HOY) + '.xlsx';
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })); a.download = nom; document.body.appendChild(a); a.click(); a.remove();
    M.ok = 'Matriz generada: ' + nom;
  } catch (err) { M.msg = esc(err.message) }
  feedback(); const mm = $('#m_msg'); if (mm) mm.scrollIntoView({ block: 'center' });
}
VIEW.mat = mat;
const _r = render; render = function () { _r(); if (S.page === 'mat') bindMat() };
render();
})();
