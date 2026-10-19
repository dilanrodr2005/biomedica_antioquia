/* Extensiones del piloto: validación de datos y registro de alternativas en el catálogo (datos de ejemplo). */
(function () {
const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
const LS = { g: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v } catch (e) { return d } }, s: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} } };
const hoy = iso(HOY);
const tg = (t, k = '') => `<span class="tag ${k}">${t}</span>`;
const X = { msg: {} };
const grupo = n => GRUPOS.find(g => g.equipo === n);
const llaveM = c => c.equipo + '|' + c.marca + '|' + c.modelo;

/* ---- alternativas agregadas por el usuario (guardadas en el navegador) ---- */
const hidratar = m => { const g = grupo(m.equipo); return g ? { servicio: g.servicio, equipo: g.equipo, marca: m.marca, modelo: m.modelo, invima: m.invima, proveedor: m.proveedor, req: g.req, val: m.val,
  spec: g.req.map((r, i) => r[0] + ': ' + m.val[i]).join(', '), pmin: m.pmin, pmax: m.pmax, gar: m.gar, vida: g.vida, acc: g.acc, fprecio: m.fprecio } : null };
CAT.push(...LS.g('x_cat', []).map(hidratar).filter(Boolean));
const vals = LS.g('x_val', {}); CAT.forEach(c => { const v = vals[llaveM(c)]; if (v) { c.fprecio = v.f; c.resp = v.r } });

/* ---- Validación y actualización de la información ---- */
const LIM = { Mensual: 30, Trimestral: 90, Semestral: 180 };
function valid() {
  const lim = LIM[S.per], R = CAT.map((c, i) => { const a = Math.round((HOY - new Date(c.fprecio)) / DAY); return { i, c: c.equipo + ' · ' + c.marca + ' ' + c.modelo, f: c.fprecio, a, r: c.resp || 'Equipo #14', s: a <= lim ? 'Validado' : a <= lim * 1.5 ? 'Por validar' : 'Desactualizado' } });
  const n = s => R.filter(r => r.s === s).length;
  return `<p>Periodicidad de actualización: <b>${S.per}</b> (máximo ${lim} días). Se cambia en Configuración.</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px">${['Validado', 'Por validar', 'Desactualizado'].map(s => `<div class="card"><b style="font-size:28px">${n(s)}</b><br>${s}</div>`).join('')}</div>
  ${table([['c', 'Equipo'], ['f', 'Fecha del precio'], ['a', 'Antigüedad (días)'], ['r', 'Responsable'], ['s', 'Estado', v => tg(v, v === 'Validado' ? 'ok' : v === 'Por validar' ? 'w' : 'r')], ['i', 'Acción', v => `<button class="btn s" data-v="${v}">Validar</button>`]], R)}
  <div class="note">Al validar se registra la fecha de hoy y el responsable. En producción la validación se haría contra una cotización o estudio de mercado soportado.</div>`;
}

/* ---- Registro de alternativas (marca / modelo / proveedor) en el catálogo ---- */
const fld = (id, l, t = 'text', x = '') => `<label>${l}<input id="${id}" type="${t}" ${x}></label>`;
const opts = a => a.map(o => `<option>${esc(o)}</option>`).join('');
const msg = k => X.msg[k] ? `<div class="note">${X.msg[k]}</div>` : '';
function reg() {
  const g = grupo(X.rg) || GRUPOS[0];
  return `<div class="card"><h3>Agregar una alternativa al catálogo</h3>
  <p style="margin:0 0 8px;font-size:13px">Registra otra marca, modelo o proveedor de un equipo existente, con las especificaciones que ofrece. Quedará disponible en el catálogo y en la Matriz de Dotación.</p>
  <div class="filters"><label>Equipo<select id="c_q">${GRUPOS.map(x => `<option ${x.equipo === g.equipo ? 'selected' : ''}>${esc(x.equipo)}</option>`).join('')}</select></label>
  ${fld('c_ma', 'Marca')}${fld('c_mo', 'Modelo')}${fld('c_p', 'Proveedor')}<label>Registro INVIMA<select id="c_i">${opts(['Vigente', 'En renovación', 'Vencido'])}</select></label>
  ${fld('c_mn', 'Precio mínimo (COP)', 'number')}${fld('c_mx', 'Precio máximo (COP)', 'number')}${fld('c_g', 'Garantía (años)', 'number', 'min="0" value="1"')}</div>
  <h4 style="margin:10px 0 6px">Especificaciones que ofrece este modelo</h4>
  <div class="filters">${g.req.map((r, i) => `<label>${esc(r[0])} <small style="color:var(--mut)">(mín.: ${esc(r[1])})</small><input id="c_v${i}" type="text"></label>`).join('')}</div>
  <button class="btn" id="c_ok">Agregar al catálogo</button>${msg('c')}</div>
  <div class="card" style="margin-top:14px"><h3>Datos del piloto</h3><p style="margin:0 0 8px;font-size:13px">Lo que registres se guarda solo en este navegador. Para volver a los datos de ejemplo:</p><button class="btn s" id="x_reset">Restablecer datos de ejemplo</button></div>`;
}
Object.assign(VIEW, { valid, reg });

function xbind() {
  const p = S.page;
  if (p === 'valid') $$('[data-v]').forEach(b => b.onclick = () => { const c = CAT[+b.dataset.v]; c.fprecio = hoy; c.resp = 'Admin Departamental'; const v = LS.g('x_val', {}); v[llaveM(c)] = { f: hoy, r: c.resp }; LS.s('x_val', v); render() });
  if (p === 'reg') {
    $('#c_q').onchange = e => { X.rg = e.target.value; X.msg.c = ''; render() };
    $('#c_ok').onclick = () => {
      const g = grupo($('#c_q').value), t = id => $('#' + id).value.trim(), mn = +t('c_mn'), mx = +t('c_mx'), v = g.req.map((_, i) => t('c_v' + i));
      if (!t('c_ma') || !t('c_mo') || !t('c_p') || v.some(x => !x)) X.msg.c = 'Completa marca, modelo, proveedor y todas las especificaciones.';
      else if (!(mn > 0 && mx >= mn)) X.msg.c = 'El precio máximo debe ser mayor o igual al mínimo, y ambos mayores que cero.';
      else if (CAT.some(c => c.equipo === g.equipo && c.marca.toLowerCase() === t('c_ma').toLowerCase() && c.modelo.toLowerCase() === t('c_mo').toLowerCase())) X.msg.c = 'Esa marca y modelo ya existen para este equipo.';
      else { const m = { equipo: g.equipo, marca: t('c_ma'), modelo: t('c_mo'), invima: $('#c_i').value, proveedor: t('c_p'), pmin: mn, pmax: mx, gar: Math.max(0, +t('c_g') || 0), val: v, fprecio: hoy }; CAT.push(hidratar(m)); LS.s('x_cat', LS.g('x_cat', []).concat(m)); X.msg.c = 'Alternativa agregada al catálogo.'; X.rg = g.equipo }
      render() };
    $('#x_reset').onclick = () => { ['x_cat', 'x_val'].forEach(k => localStorage.removeItem(k)); location.reload() };
  }
}
const _render = render; render = function () { _render(); xbind() };
render();
})();
