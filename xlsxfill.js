/* Llenado de la Matriz de Dotación Biomédica (xlsx) editando directamente el XML de la plantilla,
   para conservar formato, combinaciones de celdas, listas desplegables y logotipo.
   Requiere JSZip. Funciona en el navegador y en Node (para pruebas). */
(function (root) {
const ESTADOS = ['BUEN ESTADO ', 'MAL ESTADO ', 'REGULAR ESTADO ', 'NO APLICA '];
const REFERENCIAS = ['RENOVACION TECNOLOGICA ', 'OBSOLESCENCIA TECNOLOGICA ', 'REPOSICION TECNOLOGICA ', 'HABILITACION DE SERVICIOS ', 'AMPLIACION CAPACIDAD INSTALADA ', 'SERVICIO TERCERIZADO '];
const BASE = [{ a: 18, z: 31, acc: 30 }, { a: 32, z: 45, acc: 44 }, { a: 46, z: 68, acc: 64 }];
const bloques = n => BASE.concat(Array.from({ length: Math.max(0, n - 3) }, (_, j) => ({ a: 69 + 14 * j, z: 82 + 14 * j, acc: 81 + 14 * j })));
const ENTRADAS = ['B', 'C', 'D', 'E', 'F', 'H', 'I', 'J', 'K', 'L', 'N', 'P', 'Q', 'R', 'S', 'T', 'X', 'Y', 'Z'];

const esc = s => String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cellRe = ref => new RegExp('<c r="' + ref + '"((?:\\s[^>]*?)?)(?:/>|>([\\s\\S]*?)</c>)');
const sinT = a => a.replace(/\s+t="[^"]*"/, '');

function setCell(xml, ref, val) {                    // val: undefined/null/'' = vaciar; number = número; string = texto
  const re = cellRe(ref); if (!re.test(xml)) throw new Error('Celda no encontrada en la plantilla: ' + ref);
  return xml.replace(re, (m, a) => {
    a = sinT(a);
    if (val === undefined || val === null || val === '') return '<c r="' + ref + '"' + a + '/>';
    if (typeof val === 'number') return '<c r="' + ref + '"' + a + '><v>' + val + '</v></c>';
    return '<c r="' + ref + '"' + a + ' t="inlineStr"><is><t xml:space="preserve">' + esc(val) + '</t></is></c>';
  });
}
function setCached(xml, ref, val) {                  // actualiza el valor en caché de una celda con fórmula
  const re = cellRe(ref); if (!re.test(xml)) throw new Error('Celda no encontrada en la plantilla: ' + ref);
  return xml.replace(re, (m, a, body) => {
    const f = (body || '').match(/<f[^>]*>[\s\S]*?<\/f>|<f[^>]*\/>/); if (!f) throw new Error('La celda ' + ref + ' no tiene fórmula');
    a = sinT(a); const str = typeof val === 'string';
    return '<c r="' + ref + '"' + a + (str ? ' t="str"' : '') + '>' + f[0] + '<v>' + (str ? esc(val) : val) + '</v></c>';
  });
}

/* La plantilla trae 3 bloques de equipo. Para más equipos se clona el bloque 2 (14 filas) debajo del último,
   con sus celdas combinadas, fórmulas, listas desplegables y totales ajustados. */
function extender(xml, extra) {
  const base = {}, re = /<row r="(\d+)"[\s\S]*?<\/row>/g; let m;
  while ((m = re.exec(xml))) { const r = +m[1]; if (r >= 32 && r <= 45) base[r] = m[0] }
  const merges = [...xml.matchAll(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"\/>/g)].filter(x => +x[2] >= 32 && +x[4] <= 45);
  const shift = (t, o) => t.replace(/<row r="(\d+)"/, (_, r) => '<row r="' + (+r + o) + '"').replace(/<c r="([A-Z]+)(\d+)"/g, (_, c, r) => '<c r="' + c + (+r + o) + '"')
    .replace(/<f>([\s\S]*?)<\/f>/g, (_, f) => '<f>' + f.replace(/\b([A-Z]{1,2})(\d+)\b/g, (_, c, r) => c + (+r + o)) + '</f>');
  let filas = '', mc = '', n = 0;
  for (let j = 0; j < extra; j++) { const o = 69 + 14 * j - 32;
    for (let r = 32; r <= 45; r++) filas += shift(base[r], o);
    merges.forEach(x => { mc += '<mergeCell ref="' + x[1] + (+x[2] + o) + ':' + x[3] + (+x[4] + o) + '"/>'; n++ }) }
  const fin = 68 + 14 * extra;
  xml = xml.replace('</sheetData>', filas + '</sheetData>').replace('</mergeCells>', mc + '</mergeCells>').replace(/<mergeCells count="(\d+)"/, (_, c) => '<mergeCells count="' + (+c + n) + '"')
    .replace('<dimension ref="A1:AD68"/>', '<dimension ref="A1:AD' + fin + '"/>').replace('<xm:sqref>X18:X68</xm:sqref>', '<xm:sqref>X18:X' + fin + '</xm:sqref>').replace('<xm:sqref>Y18:Y68</xm:sqref>', '<xm:sqref>Y18:Y' + fin + '</xm:sqref>')
    .replace('<f>SUM(W18:W68)</f>', '<f>SUM(W18:W' + fin + ')</f>').replace('<f>SUM(G18:G68)</f>', '<f>SUM(G18:G' + fin + ')</f>');
  return xml;
}

function llenarHoja(xml, d) {
  const e = d.ese || {}, items = d.items;
  if (items.length > 3) xml = extender(xml, items.length - 3);
  const ent = v => (v === undefined || v === null || v === '' ? '' : v);
  const num = v => (v === '' || v === undefined || v === null || isNaN(+v) ? ent(v) : +v);
  xml = setCell(xml, 'H3', ent(e.nombre)); xml = setCell(xml, 'K4', e.plazo ? e.plazo + ' MESES' : '');
  xml = setCell(xml, 'M6', ent(e.sedes)); xml = setCell(xml, 'H6', ent(e.proyecto)); xml = setCell(xml, 'K6', ent(e.caracter));
  xml = setCell(xml, 'K8', num(e.nivel)); xml = setCell(xml, 'H10', ent(e.nit)); xml = setCell(xml, 'K10', num(e.pgn));
  xml = setCell(xml, 'H12', ent(e.departamento)); xml = setCell(xml, 'K12', num(e.otros)); xml = setCell(xml, 'H14', ent(e.municipio));

  const tot = new Map(); items.forEach(it => tot.set(it.servicio, (tot.get(it.servicio) || 0) + it.cant));
  const lista = [...tot];
  const orden = [4, 6, 8, 10, 12].map(r => [r, 'N', 'P']).concat([4, 6, 8, 10, 12].map(r => [r, 'R', 'S']));
  orden.forEach(([r, c1, c2], i) => { const t = lista[i]; xml = setCell(xml, c1 + r, t ? t[0] : ''); xml = setCell(xml, c2 + r, t ? t[1] : '') });

  let sumW = 0, sumG = 0;
  bloques(items.length).forEach((b, bi) => {
    for (let r = b.a; r <= b.z; r++) ENTRADAS.forEach(c => { xml = setCell(xml, c + r, '') });
    const it = items[bi], a = b.a;
    if (bi >= 3) xml = setCell(xml, 'A' + a, bi + 1);
    if (!it) { xml = setCached(xml, 'G' + a, 0); xml = setCached(xml, 'O' + a, ''); xml = setCached(xml, 'U' + a, ''); xml = setCached(xml, 'W' + a, 0); return }
    const [p1, p2] = it.alts;
    xml = setCell(xml, 'B' + a, it.servicio); xml = setCell(xml, 'C' + a, it.ambiente); xml = setCell(xml, 'D' + a, it.sede);
    xml = setCell(xml, 'E' + a, it.cant); xml = setCell(xml, 'F' + a, it.equipo);
    it.req.forEach((q, i) => {
      const r = a + i; if (r >= b.acc) return;
      xml = setCell(xml, 'H' + r, q[0] + ': ' + q[1]);
      xml = setCell(xml, 'K' + r, q[0] + ': ' + p1.val[i]); xml = setCell(xml, 'R' + r, q[0] + ': ' + p2.val[i]);
    });
    if (it.acc) xml = setCell(xml, 'H' + b.acc, 'Accesorios: ' + it.acc);
    xml = setCell(xml, 'I' + a, p1.proveedor); xml = setCell(xml, 'J' + a, p1.marca + ' ' + p1.modelo); xml = setCell(xml, 'N' + a, +p1.precio);
    xml = setCell(xml, 'P' + a, p2.proveedor); xml = setCell(xml, 'Q' + a, p2.marca + ' ' + p2.modelo); xml = setCell(xml, 'T' + a, +p2.precio);
    xml = setCell(xml, 'X' + a, ent(it.estado)); xml = setCell(xml, 'Y' + a, ent(it.referencia)); xml = setCell(xml, 'Z' + a, ent(it.justif));
    const o = p1.precio * it.cant, u = p2.precio * it.cant, w = Math.min(o, u);
    xml = setCached(xml, 'G' + a, it.cant); xml = setCached(xml, 'O' + a, o); xml = setCached(xml, 'U' + a, u); xml = setCached(xml, 'W' + a, w);
    sumW += w; sumG += it.cant;
  });
  xml = setCached(xml, 'Y14', sumW); xml = setCached(xml, 'K14', sumW); xml = setCached(xml, 'AC14', sumG);
  return xml;
}

/* ---- Hoja adicional "Comparativo": todas las alternativas elegidas (2 o 3) lado a lado ---- */
const COL = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
function hojaComparativo(items) {
  const maxK = Math.max(...items.map(i => i.alts.length)), ultCol = COL[1 + maxK];
  const filas = []; let r = 0;
  const cel = (c, st, v, f) => { const ref = COL[c] + r; if (v === '' || v === undefined) return '<c r="' + ref + '" s="' + st + '"/>';
    if (f) return '<c r="' + ref + '" s="' + st + '"><f>' + f + '</f><v>' + v + '</v></c>';
    return typeof v === 'number' ? '<c r="' + ref + '" s="' + st + '"><v>' + v + '</v></c>' : '<c r="' + ref + '" s="' + st + '" t="inlineStr"><is><t xml:space="preserve">' + esc(v) + '</t></is></c>' };
  const fila = (celdas, ht) => { r++; filas.push('<row r="' + r + '"' + (ht ? ' ht="' + ht + '" customHeight="1"' : '') + '>' + celdas().join('') + '</row>') };
  fila(() => [cel(0, 152, 'COMPARATIVO DE ALTERNATIVAS (ESTUDIO DE MERCADO)')]);
  fila(() => [cel(0, 40, 'Hoja adicional generada por el sistema. La matriz oficial compara dos estudios de mercado por equipo (Estudio No. 1 y No. 2); aquí se muestran todas las alternativas elegidas. Los precios de catálogo son de referencia y deben reemplazarse por los de las cotizaciones.')], 48);
  items.forEach((it, n) => {
    const k = it.alts.length; r++; filas.push('<row r="' + r + '"/>');
    fila(() => [cel(0, 152, 'Ítem ' + (n + 1) + ' · ' + it.equipo + ' · cantidad total: ' + it.cant)]);
    fila(() => [cel(0, 149, 'Criterio'), cel(1, 149, 'Mínimo exigido por la ESE')].concat(it.alts.map((_, i) => cel(2 + i, 149, 'Alternativa ' + (i + 1)))));
    const t = (lab, mn, fn) => fila(() => [cel(0, 40, lab), cel(1, 40, mn)].concat(it.alts.map((a, i) => cel(2 + i, 50, fn(a, i)))));
    t('Ubicación en la matriz', '', (a, i) => i < 2 ? 'Estudio de mercado No. ' + (i + 1) : 'Solo en esta hoja');
    t('Proveedor', '', a => a.proveedor); t('Marca y modelo', '', a => a.marca + ' ' + a.modelo); t('Registro INVIMA', '', a => a.invima);
    t('Garantía de referencia (años)', '', a => a.gar); t('Vida útil de referencia (años)', '', a => it.vida);
    it.req.forEach((q, i) => t(q[0], q[1], a => a.val[i]));
    r++; const rp = r; filas.push('<row r="' + r + '">' + [cel(0, 40, 'Precio unitario IVA incluido'), cel(1, 40, '')].concat(it.alts.map((a, i) => cel(2 + i, 51, +a.precio))).join('') + '</row>');
    r++; const rt = r; filas.push('<row r="' + r + '">' + [cel(0, 40, 'Valor total IVA incluido (× ' + it.cant + ')'), cel(1, 40, '')].concat(it.alts.map((a, i) => cel(2 + i, 51, a.precio * it.cant, COL[2 + i] + rp + '*' + it.cant))).join('') + '</row>');
    const ult = COL[1 + k], mn = Math.min(...it.alts.map(a => a.precio * it.cant));
    r++; filas.push('<row r="' + r + '">' + [cel(0, 149, 'Valor menor cotizado'), cel(1, 149, ''), cel(2, 51, mn, 'MIN(C' + rt + ':' + ult + rt + ')')].join('') + '</row>');
  });
  const cols = '<cols><col min="1" max="1" width="38" customWidth="1"/><col min="2" max="2" width="36" customWidth="1"/><col min="3" max="' + (2 + maxK) + '" width="34" customWidth="1"/></cols>';
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/>' + cols +
    '<sheetData>' + filas.join('') + '</sheetData><mergeCells count="1"><mergeCell ref="A2:' + ultCol + '2"/></mergeCells><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>';
}

function estilos(xml) {
  xml = xml.replace(/<fonts count="(\d+)"([^>]*)>/, (m, n, x) => '<fonts count="' + (+n + 1) + '"' + x + '>').replace('</fonts>', '<font><b/><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts>');
  xml = xml.replace(/<fills count="(\d+)">/, (m, n) => '<fills count="' + (+n + 1) + '">').replace('</fills>', '<fill><patternFill patternType="solid"><fgColor rgb="FFD9E8D5"/><bgColor indexed="64"/></patternFill></fill></fills>');
  const nf = +xml.match(/<fonts count="(\d+)"/)[1] - 1, nfi = +xml.match(/<fills count="(\d+)"/)[1] - 1, nx = +xml.match(/<cellXfs count="(\d+)"/)[1];
  if (nx !== 149) throw new Error('Plantilla distinta de la esperada (estilos)');
  xml = xml.replace(/<cellXfs count="\d+">/, '<cellXfs count="' + (nx + 4) + '">').replace('</cellXfs>',
    '<xf numFmtId="0" fontId="' + nf + '" fillId="' + nfi + '" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="' + nf + '" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>');
  return xml;
}

async function llenarMatriz(JSZipLib, plantilla, datos) {
  if (!datos.items.length) throw new Error('Agregue al menos un equipo');
  datos.items.forEach(it => { if (it.alts.length < 2 || it.alts.length > 12) throw new Error('Cada equipo necesita entre 2 y 12 alternativas') });
  const zip = await JSZipLib.loadAsync(plantilla, { base64: typeof plantilla === 'string' });
  const rd = p => zip.file(p).async('string');
  zip.file('xl/worksheets/sheet1.xml', llenarHoja(await rd('xl/worksheets/sheet1.xml'), datos));
  zip.file('xl/worksheets/sheet3.xml', hojaComparativo(datos.items));
  zip.file('xl/styles.xml', estilos(await rd('xl/styles.xml')));
  let wb = await rd('xl/workbook.xml');
  wb = wb.replace('</sheets>', '<sheet name="Comparativo" sheetId="3" r:id="rId10"/></sheets>').replace('<calcPr calcId="191029"/>', '<calcPr calcId="191029" fullCalcOnLoad="1"/>');
  zip.file('xl/workbook.xml', wb);
  let rels = await rd('xl/_rels/workbook.xml.rels');
  rels = rels.replace(/<Relationship [^>]*calcChain[^>]*\/>/, '').replace('</Relationships>', '<Relationship Id="rId10" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/></Relationships>');
  zip.file('xl/_rels/workbook.xml.rels', rels);
  let ct = await rd('[Content_Types].xml');
  ct = ct.replace(/<Override PartName="\/xl\/calcChain.xml"[^>]*\/>/, '').replace('</Types>', '<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
  zip.file('[Content_Types].xml', ct); zip.remove('xl/calcChain.xml');
  try { let ap = await rd('docProps/app.xml');
    ap = ap.replace(/(<vt:lpstr>Hojas de cálculo<\/vt:lpstr><\/vt:variant><vt:variant><vt:i4>)2(<\/vt:i4>)/, '$13$2').replace(/<TitlesOfParts><vt:vector size="(\d+)"/, (m, n) => '<TitlesOfParts><vt:vector size="' + (+n + 1) + '"').replace(/(<vt:lpstr>Hoja1<\/vt:lpstr>)/, '$1<vt:lpstr>Comparativo</vt:lpstr>');
    zip.file('docProps/app.xml', ap) } catch (e) {}
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
root.XlsxFill = { llenarMatriz, ESTADOS, REFERENCIAS };
})(typeof window !== 'undefined' ? window : globalThis);
