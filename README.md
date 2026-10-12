# Piloto – Tecnología Biomédica ESE Antioquia
> El mapa usa Leaflet + OpenStreetMap (requiere internet). Para exponer, abre `dashboard_biomedica.html` (archivo único).
Propuesta FO-M1-P7-024 v2 · Equipo #14. HTML + CSS + JavaScript puro, sin instalaciones.

## Cómo abrirlo en Visual Studio Code
1. Descomprimir y en VS Code: Archivo > Abrir carpeta.
2. Instalar la extensión **Live Server** (VS Code la sugiere al abrir la carpeta).
3. Clic derecho en `index.html` > *Open with Live Server*. También funciona abriendo `index.html` directo en el navegador.

## Estructura
| Archivo | Contenido |
|---|---|
| `index.html` | Estructura base (menú lateral y contenedor principal) |
| `css/styles.css` | Estilos y colores (variables al inicio, modo claro/oscuro) |
| `js/data.js` | Datos de ejemplo: `CAT` (catálogo), `ESE`, `INV` (inventario) |
| `js/app.js` | Estado, una función por módulo y eventos |

## Qué modificar
- **Datos reales:** editar `CAT`, `ESE` e `INV` en `js/data.js`, o cargar un JSON con `fetch` desde `app.js` (requiere Live Server).
- **Colores:** variables `--g`, `--gd`, `--w`, `--r` en `css/styles.css`.
- **Nuevo módulo:** agregar una entrada en `PAGES`, una función de vista y registrarla en `VIEW` y `TIT` (`js/app.js`).
- **Campos del catálogo:** columnas en las funciones `cat()` y `ficha()`.

## Módulos
Dashboard, Catálogo de referencia, Inventario de ESE (hoja de vida), Reportes y alertas, Gestión de ESE, Proveedores y Configuración.
Variables: Servicio, Equipo, Marca, Modelo, Estado INVIMA, Proveedor y Especificaciones.

## Limitaciones
Datos ficticios, sin base de datos ni usuarios; la configuración no se guarda al recargar. Los precios son de referencia y no sustituyen estudios de mercado.

## Extensiones (js/extra.js)
Agregan lo que faltaba frente a la propuesta, con datos de ejemplo:
- **Ficha completa** del catálogo: los 18 campos de la Fase 2 más el estado INVIMA, y la aclaración de que la herramienta no obliga a comprar equipos o proveedores.
- **Proyectos de Dotación (Adquisición):** etapa, presupuesto frente al valor de referencia del catálogo.
- **Hoja de vida ampliada:** historial de mantenimientos, documentos, soporte y garantía, y registro de visitas.
- **Planeación de Reposición:** equipos al final de su vida útil con costo estimado desde el catálogo.
- **Indicadores y Mejora Continua:** metas, necesidades recurrentes, tendencia de precios e informe imprimible (PDF).
- **Validación de Datos:** estado, fecha y responsable según la periodicidad configurada.
- **Registro y Carga:** formularios de inventario y catálogo, y carga desde CSV. Se guarda en el navegador (localStorage).
- **Vista por rol (simulada):** selector "Vista" en el encabezado (Secretaría o una ESE).
