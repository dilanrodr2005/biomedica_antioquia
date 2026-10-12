/* Extensiones del piloto: cobertura de las fases 1 a 5 de la propuesta FO-M1-P7-024 (datos de ejemplo). */
(function () {
const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
const LS = { g: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v } catch (e) { return d } }, s: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} } };
const hoy = iso(HOY), prom = c => (c.pmin + c.pmax) / 2, catBy = n => CAT.find(c => c.equipo === n);
const hash = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const tg = (t, k = '') => `<span class="tag ${k}">${t}</span>`;
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const dias = f => Math.round((new Date(f) - HOY) / DAY);
const X = { msg: {} };
const ESTADOS = ['Operativo', 'En mantenimiento', 'Fuera de servicio'];

/* ---- datos agregados por el usuario (guardados en el navegador) ---- */
CAT.push(...LS.g('x_cat', []));
const vals = LS.g('x_val', {}); CAT.forEach(c => { if (vals[c.equipo]) { c.fprecio = vals[c.equipo].f; c.resp = vals[c.equipo].r } });
INV.push(...LS.g('x_inv', []));
const INV_FULL = INV.slice(), ESE_FULL = ESE.slice();

/* ---- Fase 2: ficha completa (18 campos + INVIMA) ---- */
const SV = {
  'Imagenología': ['Apoyo diagnóstico por imágenes', 'Sala adecuada, red eléctrica regulada y blindaje radiológico si aplica', 'Preventivo semestral y control de calidad anual'],
  'Urgencias': ['Atención y estabilización de pacientes críticos', 'Toma eléctrica con respaldo y ubicación de fácil acceso', 'Preventivo semestral y verificación de baterías'],
  'Hospitalización': ['Monitoreo y terapia de pacientes hospitalizados', 'Toma eléctrica regulada', 'Preventivo semestral y calibración anual'],
  'Cirugía': ['Procedimientos quirúrgicos', 'Quirófano con red eléctrica de grado hospitalario y soporte de techo si aplica', 'Preventivo trimestral'],
  'Laboratorio': ['Análisis clínico de muestras', 'Mesón estable, red eléctrica regulada y desagüe si aplica', 'Preventivo semestral y calibración con controles'],
  'Obstetricia': ['Seguimiento materno-fetal', 'Toma eléctrica regulada', 'Preventivo semestral'],
  'Odontología': ['Atención odontológica', 'Conexión eléctrica, aire comprimido y agua', 'Preventivo semestral'],
  'Esterilización': ['Esterilización de instrumental y dispositivos', 'Agua, desagüe y red eléctrica según el equipo', 'Preventivo trimestral y validación de ciclos']
};
ficha = function (c) {
  const v = SV[c.servicio] || ['—', '—', '—'], p = c.spec.split(', '), k = Math.ceil(p.length / 2), rest = p.slice(k);
  const obs = c.invima === 'Vencido' ? 'Registro INVIMA vencido: verificar su renovación antes de formular el proyecto.' : c.invima === 'En renovación' ? 'Registro INVIMA en renovación: confirmar vigencia con el proveedor.' : 'Confirmar disponibilidad y vigencia del precio mediante estudio de mercado.';
  const r = [['Tipo / nombre del equipo', c.equipo], ['Categoría o grupo tecnológico', c.servicio], ['Uso o finalidad', v[0]], ['Marca y modelo', c.marca + ' ' + c.modelo],
    ['Especificaciones técnicas', c.spec], ['Requisitos técnicos mínimos', p.slice(0, k).join(', ')], ['Características complementarias o máximas', rest.length ? rest.join(', ') : 'Sin características adicionales registradas'],
    ['Accesorios requeridos', c.acc], ['Condiciones de instalación', v[1]], ['Requerimientos de mantenimiento', v[2]], ['Vida útil de referencia', c.vida + ' años'],
    ['Proveedor identificado', c.proveedor], ['Registro INVIMA', estTag(c.invima), 1], ['Rango de precio de referencia', fmt(c.pmin) + ' – ' + fmt(c.pmax), 0],
    ['Fecha de actualización del precio', c.fprecio], ['Fuente de la información', 'Cotización / estudio de mercado de referencia'],
    ['Garantía y soporte', 'A cargo del proveedor (' + c.proveedor + '); vigencia según contrato de compra'], ['Observaciones técnicas', obs]];
  return `<div class="card ficha"><h3>${esc(c.equipo)} · ${esc(c.marca)} ${esc(c.modelo)}</h3><dl>${r.map(x => `<dt>${x[0]}</dt><dd>${x[2] ? x[1] : esc(x[1])}</dd>`).join('')}</dl>
  <p style="font-size:12px;color:var(--mut);margin:10px 0 0">Valores de referencia, sin carácter obligatorio. No sustituyen el estudio de mercado ni el proceso de contratación.</p></div>`;
};

/* ---- Documentos del equipo ---- */
const docsOf = e => ['Manual de usuario', 'Certificado de calibración', 'Registro sanitario INVIMA', 'Acta de entrega'].map((d, i) => [d, hash(e.id + i) % 4 !== 0]);

/* ---- Proyectos de dotación (etapa de adquisición y ejecución) ---- */
const ESTP = ['Formulación', 'Contratación', 'Ejecución', 'Entregado'];
const PD = [
  ['PRY-001', 'Dotación de urgencias', 4, 'Ejecución', [['Desfibrilador externo automático', 2], ['Monitor de signos vitales', 3]], 1.05],
  ['PRY-002', 'Sala de partos', 7, 'Contratación', [['Monitor fetal', 2], ['Bomba de infusión', 4]], 0.7],
  ['PRY-003', 'Laboratorio clínico', 2, 'Formulación', [['Analizador de hematología', 1], ['Centrífuga clínica', 2]], 1.2],
  ['PRY-004', 'Imagenología básica', 10, 'Entregado', [['Ecógrafo Doppler', 1], ['Rayos X portátil', 1]], 0.95],
  ['PRY-005', 'Cirugía ambulatoria', 8, 'Ejecución', [['Lámpara cialítica', 1], ['Unidad electroquirúrgica', 1], ['Autoclave', 1]], 1.35],
  ['PRY-006', 'Consultorio odontológico', 9, 'Contratación', [['Unidad odontológica', 2]], 1.0],
  ['PRY-007', 'Hospitalización', 11, 'Entregado', [['Bomba de infusión', 6], ['Monitor de signos vitales', 4]], 0.85],
  ['PRY-008', 'Esterilización central', 12, 'Formulación', [['Autoclave', 2]], 1.1]];
const PROY = PD.map(([id, n, ie, st, eq, f]) => { const ref = eq.reduce((a, [q, c]) => a + prom(catBy(q)) * c, 0), pres = Math.round(ref * f / 1e5) * 1e5; return { id, n, ese: ESE[ie].ese, st, eq, ref, pres, dif: (pres - ref) / ref } });
const stepper = st => ESTP.map((e, i) => `<span class="tag ${i <= ESTP.indexOf(st) ? 'ok' : ''}" style="${i > ESTP.indexOf(st) ? 'opacity:.4' : i === ESTP.indexOf(st) ? 'font-weight:700' : ''}">${i + 1}. ${e}</span>`).join(' ');
function proy() {
  const L = PROY.filter(p => !S.rol || p.ese === S.rol), R = L.filter(p => !S.pe || p.st === S.pe), d = X.ps != null && R[X.ps];
  X.pl = R;
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:14px">${ESTP.map(e => `<div class="card"><b style="font-size:28px">${L.filter(p => p.st === e).length}</b><br>${e}</div>`).join('')}</div>
  <div class="filters"><label>Estado del proyecto<select id="pe"><option value="">Todos</option>${ESTP.map(e => `<option ${S.pe === e ? 'selected' : ''}>${e}</option>`).join('')}</select></label></div>
  ${table([['id', 'ID'], ['n', 'Proyecto'], ['ese', 'ESE'], ['st', 'Etapa', stepper], ['pres', 'Presupuesto', fmt], ['ref', 'Valor de referencia', fmt],
    ['dif', 'Diferencia', v => Math.abs(v) <= .2 ? tg(Math.round(v * 100) + '% dentro del rango', 'ok') : tg(Math.round(v * 100) + '% revisar', 'w')]], R, true)}
  ${d ? `<div class="card" style="margin-top:14px"><h3>${d.id} · ${d.n}</h3><p style="margin:0 0 8px">${d.ese}<br>${stepper(d.st)}</p>
  ${table([['e', 'Equipo'], ['q', 'Cant.'], ['u', 'Rango unitario'], ['t', 'Valor de referencia (mín – máx)']], d.eq.map(([n, q]) => { const c = catBy(n); return { e: n, q, u: fmt(c.pmin) + ' – ' + fmt(c.pmax), t: fmt(c.pmin * q) + ' – ' + fmt(c.pmax * q) } }))}
  <p>${(() => { const mn = d.eq.reduce((a, [n, q]) => a + catBy(n).pmin * q, 0), mx = d.eq.reduce((a, [n, q]) => a + catBy(n).pmax * q, 0); return d.pres < mn ? tg('Presupuesto por debajo del rango de referencia', 'r') : d.pres > mx ? tg('Presupuesto por encima del rango de referencia', 'w') : tg('Presupuesto dentro del rango de referencia', 'ok') })()}</p></div>` : '<p style="color:var(--mut)">Seleccione un proyecto para ver sus equipos y compararlos con el catálogo.</p>'}
  <div class="note">La comparación es orientativa: no sustituye el estudio de mercado ni el proceso de contratación.</div>`;
}

/* ---- Planeación de reposición (post-entrega) ---- */
function repo() {
  const y = X.ry || 2, lim = iso(add(HOY, y * 365));
  const R = INV.filter(e => e.fvida <= lim).sort((a, b) => a.fvida < b.fvida ? -1 : 1).map(e => ({ ...e, costo: prom(catBy(e.equipo) || { pmin: 0, pmax: 0 }), d: dias(e.fvida) }));
  X.rl = R; const tot = R.reduce((a, r) => a + r.costo, 0), by = {}; R.forEach(r => by[r.ese] = (by[r.ese] || 0) + r.costo);
  const top = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 6), mx = top.length ? top[0][1] : 1;
  return `<div class="filters"><label>Equipos que terminan su vida útil en<select id="ry">${[1, 2, 3].map(n => `<option value="${n}" ${n === y ? 'selected' : ''}>${n} año${n > 1 ? 's' : ''}</option>`).join('')}</select></label></div>
  <div class="grid g2" style="margin-bottom:14px"><div class="card"><b style="font-size:30px">${R.length}</b> equipos por reponer o actualizar<br><b style="font-size:22px;color:var(--g)">${fmt(tot)}</b><br><span style="color:var(--mut);font-size:13px">Costo estimado con el valor medio del catálogo</span></div>
  <div class="card"><h3>Mayor inversión estimada por ESE</h3>${top.map(([k, v]) => `<div>${esc(k)}: <b>${fmt(v)}</b><div class="bar"><i style="width:${v / mx * 100}%"></i></div></div>`).join('') || 'Sin equipos en el periodo.'}</div></div>
  ${table([['id', 'ID'], ['ese', 'ESE'], ['equipo', 'Equipo'], ['fvida', 'Fin de vida útil'], ['d', 'Plazo', v => v < 0 ? tg('Vencida hace ' + -v + ' días', 'r') : tg('En ' + v + ' días', 'w')], ['estado', 'Estado', estTag], ['costo', 'Costo estimado', fmt]], R)}
  <p><button class="btn s" id="rcsv">Descargar CSV</button></p><div class="note">Costos de referencia para planear la reposición; no sustituyen el estudio de mercado.</div>`;
}

/* ---- Hoja de vida ampliada: mantenimientos, documentos, soporte y visitas ---- */
function hv(e) {
  const M = [0, 1, 2].map(i => ({ f: iso(add(new Date(e.umant), -365 * i)), t: i === 0 || hash(e.id + i) % 3 ? 'Preventivo' : 'Correctivo', r: i % 2 ? 'Técnico de la ESE' : 'Proveedor o biomédico externo' })).filter(m => m.f >= e.adq);
  const V = LS.g('x_vis', []).filter(v => v.id === e.id).reverse();
  return `<div class="grid g2" style="margin-top:14px">
  <div class="card"><h3>Historial de mantenimientos</h3>${table([['f', 'Fecha'], ['t', 'Tipo'], ['r', 'Responsable']], M)}<p style="margin:8px 0 0">Próximo programado: <b>${e.pmant}</b> ${e.pmant < hoy ? tg('Vencido', 'r') : tg('Al día', 'ok')}</p></div>
  <div class="card"><h3>Documentos del equipo</h3>${docsOf(e).map(d => `<div style="display:flex;justify-content:space-between;padding:3px 0">${d[0]} ${d[1] ? tg('Entregado', 'ok') : tg('Pendiente', 'w')}</div>`).join('')}</div>
  <div class="card"><h3>Soporte y garantía</h3><p style="margin:0">Proveedor: <b>${e.proveedor}</b><br>Garantía hasta: <b>${e.fgar}</b> ${e.fgar >= hoy ? tg('Vigente', 'ok') : tg('Vencida', 'r')}<br>Soporte: línea técnica del proveedor (dato de ejemplo).</p></div>
  <div class="card"><h3>Visitas de seguimiento</h3>${V.map(v => `<div style="border-bottom:1px solid var(--bd);padding:4px 0"><b>${v.f}</b> · ${v.t}<br><span style="color:var(--mut)">${esc(v.o)}</span></div>`).join('') || '<p style="color:var(--mut);margin:0 0 8px">Sin visitas registradas.</p>'}
  <div class="filters" style="margin:10px 0 0"><label>Fecha<input id="vf" type="date" value="${hoy}"></label><label>Tipo<select id="vt"><option>Seguimiento</option><option>Verificación</option><option>Capacitación</option></select></label>
  <label style="flex:1">Observaciones<input id="vo" placeholder="Resultado de la visita"></label><button class="btn" id="vg" style="align-self:flex-end">Registrar</button></div></div></div>`;
}

/* ---- Indicadores, necesidades recurrentes y tendencia de precios ---- */
function tend(c) {
  const b = prom(c), v = [0, 1, 2, 3, 4, 5].map(i => b * (0.95 + i * 0.01 + ((hash(c.equipo + i) % 7) - 3) / 200));
  const mn = Math.min(...v) * .98, mx = Math.max(...v) * 1.02, x = i => 60 + i * 90, y = p => 160 - (p - mn) / (mx - mn) * 130;
  return `<svg viewBox="0 0 580 200" style="width:100%;max-width:640px" role="img" aria-label="Tendencia de precio de referencia">
  <polyline fill="none" stroke="#1f5a30" stroke-width="2.5" points="${v.map((p, i) => x(i) + ',' + y(p)).join(' ')}"/>
  ${v.map((p, i) => `<circle cx="${x(i)}" cy="${y(p)}" r="4" fill="#c9a227"/><text x="${x(i)}" y="${y(p) - 9}" font-size="11" text-anchor="middle" fill="#333">$${(p / 1e6).toFixed(1)} M</text><text x="${x(i)}" y="190" font-size="11" text-anchor="middle" fill="#666">${new Date(HOY.getFullYear(), HOY.getMonth() - (5 - i), 1).toLocaleDateString('es-CO', { month: 'short' })}</text>`).join('')}</svg>`;
}
function ind() {
  const n = INV.length, L = PROY.filter(p => !S.rol || p.ese === S.rol);
  const K = [['Equipos operativos', pct(INV.filter(e => e.estado === 'Operativo').length, n), 90], ['Mantenimientos al día', pct(INV.filter(e => e.pmant >= hoy).length, n), 85],
    ['Equipos dentro de su vida útil', pct(INV.filter(e => e.fvida >= hoy).length, n), 80], ['Equipos con documentación completa', pct(INV.filter(e => docsOf(e).every(d => d[1])).length, n), 80],
    ['Proyectos entregados', pct(L.filter(p => p.st === 'Entregado').length, L.length), 50]];
  const dev = L.length ? Math.round(L.reduce((a, p) => a + Math.abs(p.dif), 0) / L.length * 100) : 0;
  const cnt = {}, sv = {}; INV.forEach(e => { cnt[e.equipo] = (cnt[e.equipo] || 0) + 1; (sv[e.servicio] = sv[e.servicio] || [0, 0])[0]++; if (e.estado !== 'Operativo') sv[e.servicio][1]++ });
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 6), mxc = top.length ? top[0][1] : 1, svs = Object.entries(sv).map(([k, v]) => [k, pct(v[1], v[0])]).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const c = catBy(X.tp) || CAT[0];
  return `<div class="noprint" style="margin-bottom:12px"><button class="btn" id="prt">Imprimir o guardar informe en PDF</button></div>
  <div class="sec">Indicadores de desempeño</div><div class="grid g2">${K.map(k => `<div class="card"><div style="display:flex;justify-content:space-between"><span>${k[0]}</span>${k[1] >= k[2] ? tg('Cumple la meta', 'ok') : tg('Por debajo de la meta', 'w')}</div><b style="font-size:30px">${k[1]}%</b> <span style="color:var(--mut)">meta ${k[2]}%</span><div class="bar"><i style="width:${k[1]}%"></i></div></div>`).join('')}
  <div class="card"><span>Desviación promedio entre presupuesto y valor de referencia</span><br><b style="font-size:30px">${dev}%</b></div></div>
  <p style="font-size:13px;color:var(--mut)">Metas propuestas, por validar con la Secretaría. Datos de ejemplo.</p>
  <div class="sec">Necesidades recurrentes</div><div class="grid g2"><div class="card"><h3>Equipos más frecuentes en el inventario</h3>${top.map(([k, v]) => `<div>${k}: <b>${v}</b><div class="bar"><i style="width:${v / mxc * 100}%"></i></div></div>`).join('')}</div>
  <div class="card"><h3>Servicios con más equipos no operativos</h3>${svs.map(([k, v]) => `<div>${k}: <b>${v}%</b><div class="bar"><i style="width:${v}%;background:var(--r)"></i></div></div>`).join('')}</div></div>
  <div class="sec">Tendencia de precios de referencia (últimos 6 meses)</div><div class="card"><div class="filters noprint"><label>Equipo<select id="tp">${CAT.map(q => `<option ${q.equipo === c.equipo ? 'selected' : ''}>${q.equipo}</option>`).join('')}</select></label></div>${tend(c)}<p style="font-size:12px;color:var(--mut);margin:4px 0 0">Serie simulada con fines de demostración; la real saldría del histórico de cotizaciones.</p></div>`;
}

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

/* ---- Registro y carga de datos ---- */
const fld = (id, l, t = 'text', x = '') => `<label>${l}<input id="${id}" type="${t}" ${x}></label>`;
const opts = a => a.map(o => `<option>${esc(o)}</option>`).join('');
const msg = k => X.msg[k] ? `<div class="note">${X.msg[k]}</div>` : '';
function mkInv(ese, eq, adq, st) {
  const e = ESE_FULL.find(x => x.ese === ese), c = catBy(eq), d = new Date(adq + 'T00:00:00');
  return { id: 'EQ-' + String(INV_FULL.length + 1).padStart(4, '0'), ese, sub: e.sub, servicio: c.servicio, equipo: eq, marca: c.marca, modelo: c.modelo, proveedor: c.proveedor, adq, fvida: iso(add(d, c.vida * 365)), umant: adq, pmant: iso(add(d, 365)), fgar: iso(add(d, 365)), estado: st };
}
const addInv = rows => { INV_FULL.push(...rows); INV.push(...rows); LS.s('x_inv', LS.g('x_inv', []).concat(rows)) };
function reg() {
  return `<div class="grid g2"><div class="card"><h3>Registrar equipo en el inventario</h3><div class="filters"><label>ESE<select id="r_e">${opts(ESE_FULL.map(e => e.ese))}</select></label><label>Equipo (catálogo)<select id="r_q">${opts(CAT.map(c => c.equipo))}</select></label>
  ${fld('r_f', 'Fecha de adquisición', 'date', 'value="' + hoy + '"')}<label>Estado<select id="r_s">${opts(ESTADOS)}</select></label></div><button class="btn" id="r_ok">Registrar</button>${msg('r')}</div>
  <div class="card"><h3>Cargar inventario desde CSV</h3><p style="margin:0 0 8px;font-size:13px">Columnas: ese, equipo, fecha_adquisicion (AAAA-MM-DD), estado.</p><input type="file" id="f_csv" accept=".csv"> <button class="btn s" id="f_tpl">Descargar plantilla</button>${msg('f')}</div></div>
  <div class="card" style="margin-top:14px"><h3>Agregar equipo al catálogo de referencia</h3><datalist id="dl">${opts(uniq(CAT, 'servicio'))}</datalist><div class="filters">
  <label>Servicio<input id="c_s" list="dl"></label>${fld('c_q', 'Equipo')}${fld('c_ma', 'Marca')}${fld('c_mo', 'Modelo')}<label>Registro INVIMA<select id="c_i">${opts(['Vigente', 'En renovación', 'Vencido'])}</select></label>
  ${fld('c_p', 'Proveedor')}${fld('c_sp', 'Especificaciones (separadas por coma)')}${fld('c_ac', 'Accesorios')}${fld('c_mn', 'Precio mínimo (COP)', 'number')}${fld('c_mx', 'Precio máximo (COP)', 'number')}${fld('c_v', 'Vida útil (años)', 'number')}</div>
  <button class="btn" id="c_ok">Agregar al catálogo</button>${msg('c')}</div>
  <div class="card" style="margin-top:14px"><h3>Datos del piloto</h3><p style="margin:0 0 8px;font-size:13px">Lo que registres se guarda solo en este navegador. Para volver a los datos de ejemplo:</p><button class="btn s" id="x_reset">Restablecer datos de ejemplo</button></div>`;
}
function csvLoad(t) {
  const L = t.replace(/^\ufeff/, '').split(/\r?\n/).filter(x => x.trim()), ok = [], err = [];
  L.slice(1).forEach((l, i) => { const [e, q, f, s] = l.replace(/"/g, '').split(/[,;]/).map(x => x.trim()), st = s || 'Operativo';
    if (!ESE_FULL.find(x => x.ese === e)) err.push('fila ' + (i + 2) + ': ESE no encontrada'); else if (!catBy(q)) err.push('fila ' + (i + 2) + ': equipo no está en el catálogo');
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || isNaN(new Date(f))) err.push('fila ' + (i + 2) + ': fecha inválida'); else if (!ESTADOS.includes(st)) err.push('fila ' + (i + 2) + ': estado inválido');
    else ok.push(mkInv(e, q, f, st)); ok.forEach((r, j) => r.id = 'EQ-' + String(INV_FULL.length + 1 + j).padStart(4, '0')) });
  if (ok.length) addInv(ok);
  return `${ok.length} equipos cargados, ${err.length} con error.${err.length ? '<br>' + err.slice(0, 5).join('<br>') : ''}`;
}

/* ---- Menú, títulos y vistas ---- */
Object.assign(ICON, {
  proy: '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="4" height="13" rx="1"/>',
  repo: '<path d="M20 11a8 8 0 00-14.5-4M4 4v4h4M4 13a8 8 0 0014.5 4M20 20v-4h-4"/>',
  ind: '<path d="M3 21h18M6 21V11M12 21V4M18 21v-7"/>',
  valid: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5L16 9.5"/>',
  reg: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M12 11v6M9 14h6"/>'
});
const BASE = Object.fromEntries(MENU.map(m => [m[0], m]));
[['proy', 'Proyectos de Dotación', '(Adquisición)', 'proy'], ['repo', 'Planeación de Reposición', '(Post-entrega)', 'repo'], ['ind', 'Indicadores', '(Seguimiento y mejora)', 'ind'], ['valid', 'Validación de Datos', '(Calidad)', 'valid'], ['reg', 'Registro y Carga', '', 'reg']].forEach(m => BASE[m[0]] = m);
const ORDEN = ['dash', 'cat', 'proy', 'inv', 'repo', 'rep', 'ind', 'ese', 'prov', 'valid', 'reg', 'cfg'], ADMIN = ['ese', 'cfg', 'valid', 'reg'];
const setMenu = () => MENU.splice(0, MENU.length, ...ORDEN.filter(k => !(S.rol && ADMIN.includes(k))).map(k => BASE[k]));
Object.assign(TIT, { proy: 'Seguimiento de Proyectos de Dotación', repo: 'Planeación de Reposición y Actualización', ind: 'Indicadores y Mejora Continua', valid: 'Validación y Actualización de la Información', reg: 'Registro y Carga de Datos' });
Object.assign(VIEW, { proy, repo, ind, valid, reg });

/* ---- Eventos de las vistas nuevas ---- */
function xbind() {
  const p = S.page, main = $('#main');
  if (p === 'cat') { const n = $('.note'); if (n) n.insertAdjacentHTML('beforeend', '<br><b>Alcance:</b> esta herramienta es de consulta y referencia; no determina de manera obligatoria los equipos o proveedores que deban adquirir las ESE.') }
  if (p === 'inv' && S.selI != null && S._inv && S._inv[S.selI]) {
    const e = S._inv[S.selI]; main.insertAdjacentHTML('beforeend', hv(e));
    $('#vg').onclick = () => { const o = $('#vo').value.trim(); if (!o) return $('#vo').focus(); LS.s('x_vis', LS.g('x_vis', []).concat({ id: e.id, f: $('#vf').value, t: $('#vt').value, o })); render() };
  }
  if (p === 'proy') { $('#pe').onchange = e => { S.pe = e.target.value; X.ps = null; render() }; $$('#main tr.click').forEach(tr => tr.onclick = () => { X.ps = +tr.dataset.i; render() }) }
  if (p === 'repo') { $('#ry').onchange = e => { X.ry = +e.target.value; render() }; $('#rcsv').onclick = () => csv('reposicion.csv', X.rl.map(r => ({ id: r.id, ese: r.ese, equipo: r.equipo, fin_vida_util: r.fvida, costo_estimado: Math.round(r.costo) }))) }
  if (p === 'ind') { $('#prt').onclick = () => window.print(); $('#tp').onchange = e => { X.tp = e.target.value; render() } }
  if (p === 'valid') $$('[data-v]').forEach(b => b.onclick = () => { const c = CAT[+b.dataset.v]; c.fprecio = hoy; c.resp = 'Admin Departamental'; const v = LS.g('x_val', {}); v[c.equipo] = { f: hoy, r: c.resp }; LS.s('x_val', v); render() });
  if (p === 'reg') {
    $('#r_ok').onclick = () => { const f = $('#r_f').value; if (!f) { X.msg.r = 'Indica la fecha de adquisición.'; return render() } const r = mkInv($('#r_e').value, $('#r_q').value, f, $('#r_s').value); addInv([r]); X.msg.r = 'Equipo registrado con el ID ' + r.id + '. Ya aparece en el inventario y en las alertas.'; render() };
    $('#f_csv').onchange = ev => { const f = ev.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { X.msg.f = csvLoad(rd.result); render() }; rd.readAsText(f) };
    $('#f_tpl').onclick = () => csv('plantilla_inventario.csv', [{ ese: ESE_FULL[0].ese, equipo: CAT[0].equipo, fecha_adquisicion: hoy, estado: 'Operativo' }]);
    $('#c_ok').onclick = () => { const g = id => $('#' + id).value.trim(), mn = +g('c_mn'), mx = +g('c_mx'), v = +g('c_v');
      if (!g('c_s') || !g('c_q') || !g('c_ma') || !g('c_mo') || !g('c_p') || !g('c_sp')) X.msg.c = 'Completa servicio, equipo, marca, modelo, proveedor y especificaciones.';
      else if (!(mn > 0 && mx >= mn)) X.msg.c = 'El precio máximo debe ser mayor o igual al mínimo, y ambos mayores que cero.';
      else if (catBy(g('c_q'))) X.msg.c = 'Ese equipo ya existe en el catálogo.';
      else { const c = { servicio: g('c_s'), equipo: g('c_q'), marca: g('c_ma'), modelo: g('c_mo'), invima: $('#c_i').value, proveedor: g('c_p'), spec: g('c_sp'), pmin: mn, pmax: mx, vida: v > 0 ? v : 8, acc: g('c_ac') || '—', fprecio: hoy }; CAT.push(c); LS.s('x_cat', LS.g('x_cat', []).concat(c)); X.msg.c = 'Equipo agregado al catálogo.' }
      render() };
    $('#x_reset').onclick = () => { ['x_cat', 'x_inv', 'x_val', 'x_vis'].forEach(k => localStorage.removeItem(k)); location.reload() };
  }
}
const _render = render; render = function () { _render(); xbind() };

/* ---- Vista por rol (simulada) y estilos de impresión ---- */
const st = document.createElement('style');
st.textContent = '@media print{#side,header.top,.noprint,.modal{display:none!important}html,body,.app,.content,main{height:auto!important;overflow:visible!important;display:block!important}main{background:#fff!important}.card,table{break-inside:avoid}}';
document.head.appendChild(st);
$('.user').insertAdjacentHTML('afterbegin', `<label class="noprint" style="font-size:11px;color:#555">Vista<br><select id="rol" style="font:inherit;font-size:12px;max-width:170px"><option value="">Secretaría (departamental)</option>${ESE_FULL.map(e => `<option value="${esc(e.ese)}">${esc(e.ese)}</option>`).join('')}</select></label>`);
$('#rol').onchange = e => {
  S.rol = e.target.value; S.page = 'dash'; S.selI = null; X.ps = null;
  INV.splice(0, INV.length, ...INV_FULL.filter(x => !S.rol || x.ese === S.rol)); ESE.splice(0, ESE.length, ...ESE_FULL.filter(x => !S.rol || x.ese === S.rol));
  $('.user small').textContent = S.rol ? 'Usuario ESE' : 'Admin Departamental'; $('.user b').textContent = S.rol ? S.rol.replace('ESE Hospital ', '') : 'Dilan Rodriguez'; setMenu(); render();
};
setMenu(); render();
})();
