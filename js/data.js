/* Utilidades y datos sintéticos (piloto). Reemplazar por datos reales. */
const HOY=new Date(); const DAY=864e5;
const add=(d,n)=>new Date(d.getTime()+n*DAY); const iso=d=>d.toISOString().slice(0,10);
const fmt=n=>'$'+Math.round(n).toLocaleString('es-CO');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ---------- Datos sintéticos (piloto) ---------- */
const CAT=[
["Imagenología","Ecógrafo Doppler","Mindray","DC-70","Vigente","MedTech Andina","Doppler color, 2 transductores (convexo y lineal), pantalla LED 21\"",38e6,62e6,10,"Gel, papel térmico"],
["Imagenología","Rayos X portátil","Siemens","Mobilett Elara","Vigente","Distrimed SAS","Generador 32 kW, colimador manual, brazo articulado",90e6,140e6,12,"Delantales plomados"],
["Urgencias","Desfibrilador externo automático","Philips","HeartStart FRx","Vigente","BioSalud Ltda","Bifásico 150 J, batería 4 años, guía de voz",6.5e6,11e6,8,"Electrodos adulto/pediátrico"],
["Urgencias","Monitor de signos vitales","Edan","iM8","Vigente","MedTech Andina","ECG, SpO2, PANI, temperatura, pantalla 8\"",4.2e6,7.8e6,8,"Brazaletes, sensor SpO2"],
["Hospitalización","Bomba de infusión","B. Braun","Infusomat Space","Vigente","Distrimed SAS","Volumétrica 0,1-1200 ml/h, batería 8 h",5e6,9e6,8,"Equipos de infusión"],
["Cirugía","Lámpara cialítica","Mediland","LED-500","Vigente","Quirúrgicos del Norte","LED 120.000 lux, techo, brazo doble",18e6,32e6,12,"Mangos esterilizables"],
["Cirugía","Unidad electroquirúrgica","Erbe","VIO 3","En renovación","BioSalud Ltda","Monopolar/bipolar, 300 W, modos de corte y coagulación",25e6,48e6,10,"Pedal, electrodos"],
["Laboratorio","Analizador de hematología","Mindray","BC-3000 Plus","Vigente","LabInstrumental","3 partes diferenciales, 60 muestras/h",22e6,36e6,8,"Reactivos, controles"],
["Laboratorio","Centrífuga clínica","Hettich","EBA 200","Vencido","LabInstrumental","6 tubos, 6000 rpm, temporizador digital",2e6,3.8e6,10,"Rotor, tubos"],
["Obstetricia","Monitor fetal","Edan","F3","Vigente","MedTech Andina","Doble FCF, TOCO, marcador de movimientos fetales",6e6,10.5e6,8,"Transductores, cintas"],
["Odontología","Unidad odontológica","Gnatus","Optimus","Vigente","Dental Andes","Sillón eléctrico, jeringa triple, lámpara LED",15e6,28e6,12,"Compresor"],
["Esterilización","Autoclave","Tuttnauer","2540M","Vigente","Quirúrgicos del Norte","Vapor 65 L, ciclos programables",20e6,35e6,12,"Agua destilada"]
].map((r,i)=>({servicio:r[0],equipo:r[1],marca:r[2],modelo:r[3],invima:r[4],proveedor:r[5],spec:r[6],pmin:r[7],pmax:r[8],vida:r[9],acc:r[10],fprecio:iso(add(HOY,-15*(i+1)))}));
const ESE=[
["ESE Hospital San Rafael","Valle de Aburrá","Itagüí",6.17,-75.61,"Alta"],["ESE Hospital Venancio Díaz","Valle de Aburrá","Sabaneta",6.15,-75.62,"Alta"],
["ESE Hospital San Juan de Dios","Oriente","Rionegro",6.16,-75.37,"Media"],["ESE Hospital San Vicente","Oriente","El Carmen de Viboral",6.08,-75.33,"Media"],
["ESE Hospital La Merced","Suroeste","Ciudad Bolívar",5.85,-76.02,"Baja"],["ESE Hospital San Juan","Suroeste","Andes",5.66,-75.88,"Media"],
["ESE Hospital Ana María","Norte","Yarumal",6.96,-75.42,"Media"],["ESE Hospital San Pedro","Norte","Santa Rosa de Osos",6.64,-75.46,"Baja"],
["ESE Hospital Sagrado Corazón","Occidente","Santa Fe de Antioquia",6.56,-75.83,"Media"],["ESE Hospital Heliodoro Mejía","Occidente","Dabeiba",7.0,-76.26,"Baja"],
["ESE Hospital Nuestra Señora","Bajo Cauca","Caucasia",7.99,-75.2,"Media"],["ESE Hospital Nuestra Señora del Carmen","Nordeste","Segovia",7.08,-74.7,"Baja"],
["ESE Hospital Julio Ortiz","Magdalena Medio","Puerto Berrío",6.49,-74.4,"Baja"],["ESE Hospital San Antonio","Urabá","Apartadó",7.88,-76.63,"Media"]
].map(r=>({ese:r[0],sub:r[1],mun:r[2],lat:r[3],lon:r[4],cap:r[5]}));
const R=rng(14), pick=a=>a[Math.floor(R()*a.length)];
const INV=Array.from({length:90},(_,i)=>{
  const c=pick(CAT), e=pick(ESE), adq=add(HOY,-(200+Math.floor(R()*365*9)));
  const um=add(HOY,-(10+Math.floor(R()*410)));
  let gar=add(adq,R()<.5?365:730); if(R()<.18) gar=add(HOY,1+Math.floor(R()*28));
  const p=R(), est=p<.78?'Operativo':p<.9?'En mantenimiento':'Fuera de servicio';
  return {id:'EQ-'+String(i+1).padStart(4,'0'),ese:e.ese,sub:e.sub,servicio:c.servicio,equipo:c.equipo,marca:c.marca,modelo:c.modelo,proveedor:c.proveedor,
    adq:iso(adq),fvida:iso(add(adq,c.vida*365)),umant:iso(um),pmant:iso(add(um,365)),fgar:iso(gar),estado:est};
});

