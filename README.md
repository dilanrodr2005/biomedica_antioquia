# Piloto – Tecnología Biomédica ESE Antioquia
Propuesta FO-M1-P7-024 v2 · Equipo #14. HTML + CSS + JavaScript puro, sin instalaciones.
El mapa usa Leaflet + Esri y el llenado del Excel usa JSZip (ambos por CDN: requiere internet). Para exponer, abre `dashboard_biomedica.html` (archivo único).

## Cómo abrirlo en Visual Studio Code
1. Descomprimir y en VS Code: Archivo > Abrir carpeta.
2. Instalar la extensión **Live Server** (VS Code la sugiere al abrir la carpeta).
3. Clic derecho en `index.html` > *Open with Live Server*. También funciona abriendo `index.html` directo en el navegador.

## Módulos
- **Inicio:** alertas de garantías por expirar y de equipos próximos a fin de vida útil, consulta rápida del catálogo y mapa por subregión.
- **Catálogo de Referencia:** filtros por servicio, **equipo**, marca, INVIMA, proveedor y precio; ficha técnica de 18 campos (incluye garantía y vida útil). Con un equipo filtrado, el botón *Llevar a la Matriz de Dotación* lo envía a la matriz.
- **Matriz de Dotación (nuevo):** el formulador busca en todo el catálogo y marca, en el orden que quiera, las alternativas (marcas, modelos o proveedores con especificaciones similares) de uno o varios equipos; el sistema las agrupa por equipo y llena la matriz oficial `Matriz_de_Dotacion_Biomedica_-2025_v3.0.xlsx` y la descarga.
- **Proveedores**, **Validación de Datos**, **Registro de Equipos** (agrega alternativas al catálogo) y **Configuración**.

Eliminados en esta versión: Proyectos de Dotación, Inventario de ESEs, Planeación de Reposición, Reportes y Alertas, Indicadores, Gestión de ESEs y todo lo relacionado con mantenimiento (se conservan garantía y vida útil).

## Cómo llena la matriz
- Cada equipo ocupa un bloque de la matriz; la plantilla trae 3 y el sistema clona el bloque para los equipos adicionales (sin tope; fórmulas, totales y listas desplegables se extienden). Las dos primeras alternativas marcadas van al **Estudio de mercado No. 1 y No. 2** (la matriz oficial compara dos); todas las demás aparecen en la hoja **Comparativo**, que el sistema agrega con todas las alternativas lado a lado y el menor valor cotizado.
- Se llenan: datos de la ESE y del proyecto, totalización por servicio, servicio/ambiente/sede/cantidad, nombre del equipo, especificaciones mínimas, proveedor, marca y modelo, cumplimiento de especificaciones, precios, estado actual, referencia de la necesidad y justificación.
- Las columnas **FOLIO** quedan vacías (página de cada cotización). Los precios del catálogo son de referencia: reemplazarlos por los de las cotizaciones.
- La plantilla va incrustada en `js/plantilla.js` (base64). El archivo se edita directamente en su XML para conservar formato, listas desplegables y logotipo; las fórmulas de la plantilla se mantienen y se recalculan al abrir.

## Estructura
| Archivo | Contenido |
|---|---|
| `index.html` | Estructura base (menú lateral y contenedor principal) |
| `css/styles.css` | Estilos y colores (variables al inicio) |
| `js/data.js` | Datos de ejemplo: `GRUPOS` (equipos con requisitos mínimos y 3 alternativas cada uno), `CAT` (derivado), `ESE`, `INV` (solo para alertas y mapa) |
| `js/app.js` | Estado, vistas de Inicio, Catálogo, Proveedores y Configuración, mapa y eventos |
| `js/matriz.js` | Pantalla de la Matriz de Dotación |
| `js/xlsxfill.js` | Llenado del Excel (edición del XML de la plantilla con JSZip) |
| `js/plantilla.js` | Plantilla oficial en base64 |
| `js/extra.js` | Validación de datos y registro de alternativas (se guardan en el navegador) |

## Qué modificar
- **Datos reales:** editar `GRUPOS` en `js/data.js`. Cada equipo trae `req` (requisito mínimo por parámetro) y cada alternativa el valor que ofrece, en el mismo orden.
- **Otra versión de la matriz:** reemplazar `js/plantilla.js` y revisar las celdas en `js/xlsxfill.js` (`BLOQUES` y `llenarHoja`).
- **Colores:** variables `--g`, `--gd`, `--w`, `--r` en `css/styles.css`.

## Limitaciones
Datos ficticios (marcas, modelos, especificaciones y precios son de ejemplo), sin base de datos ni usuarios. Los precios son de referencia y no sustituyen estudios de mercado.
