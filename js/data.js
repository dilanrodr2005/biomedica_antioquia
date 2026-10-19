/* Utilidades y datos sintéticos (piloto). Reemplazar por datos reales. */
const HOY=new Date(); const DAY=864e5;
const add=(d,n)=>new Date(d.getTime()+n*DAY); const iso=d=>d.toISOString().slice(0,10);
const fmt=n=>'$'+Math.round(n).toLocaleString('es-CO');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ---------- Catálogo de referencia (datos sintéticos del piloto) ----------
   Cada GRUPO es un equipo con sus requisitos técnicos mínimos [parámetro, mínimo exigido].
   Cada modelo es una alternativa comercial (marca, modelo, proveedor) con el valor que ofrece
   para cada requisito, en el mismo orden. Reemplazar por datos reales (cotizaciones). */
const G=(equipo,servicio,vida,acc,req,mods)=>({equipo,servicio,vida,acc,req,mods});
const GRUPOS=[
G("Ecógrafo Doppler","Imagenología",10,"Gel, papel térmico, funda de transductor",[["Modos Doppler","Color y pulsado"],["Transductores","Mínimo 2 (convexo y lineal)"],["Pantalla","LED de 19\" o más"],["Almacenamiento","Mínimo 250 GB"],["Conectividad","USB y DICOM"]],[
 ["Mindray","DC-70","Vigente","MedTech Andina",38e6,62e6,2,["Color, pulsado y continuo","2 (convexo y lineal)","LED 21\"","500 GB","USB, DICOM y HDMI"]],
 ["Samsung","HS40","Vigente","Distrimed SAS",34e6,55e6,2,["Color y pulsado","2 (convexo y lineal)","LED 19,5\"","320 GB","USB y DICOM"]],
 ["Esaote","MyLab X5","Vigente","BioSalud Ltda",42e6,68e6,3,["Color, pulsado y continuo","3 (convexo, lineal y endocavitario)","LED 21,5\"","500 GB","USB, DICOM y WiFi"]]]),
G("Rayos X portátil","Imagenología",12,"Delantales plomados, mando de disparo",[["Generador","Mínimo 30 kW"],["Rango de kV","40 a 125 kV"],["Colimador","Con luz de campo"],["Movilidad","Brazo articulado y ruedas"],["Disparo","Con cable de mano"]],[
 ["Siemens","Mobilett Elara Max","Vigente","Distrimed SAS",90e6,140e6,2,["32 kW","40–125 kV","Manual con luz LED","Brazo articulado y ruedas","Cable de mano"]],
 ["Shimadzu","MobileDaRt Evolution","Vigente","MedTech Andina",95e6,150e6,2,["32 kW","40–125 kV","Manual con luz LED","Brazo articulado y ruedas motorizadas","Cable de mano"]],
 ["GE Healthcare","AMX Navigator","Vigente","BioSalud Ltda",88e6,135e6,3,["30 kW","40–125 kV","Manual con luz halógena","Brazo articulado y ruedas","Cable de mano"]]]),
G("Desfibrilador externo automático","Urgencias",8,"Electrodos adulto y pediátrico, maletín",[["Tipo de onda","Bifásica"],["Energía","Hasta 150 J"],["Batería","Mínimo 4 años en espera"],["Guía","Instrucciones de voz en español"],["Protección","IP55 o superior"]],[
 ["Philips","HeartStart FRx","Vigente","BioSalud Ltda",6.5e6,11e6,2,["Bifásica","150 J","4 años","Voz en español","IP55"]],
 ["Zoll","AED Plus","Vigente","MedTech Andina",7.5e6,12e6,5,["Rectilínea bifásica","200 J","5 años","Voz en español y metrónomo RCP","IP55"]],
 ["Cardiac Science","Powerheart G5","Vigente","Distrimed SAS",7e6,11.5e6,4,["Bifásica","200 J","4 años","Voz en español","IP55"]]]),
G("Monitor de signos vitales","Urgencias",8,"Brazaletes, sensor SpO2, cable ECG",[["Parámetros","ECG, SpO2, PANI y temperatura"],["Pantalla","8\" o más"],["Alarmas","Visuales y sonoras"],["Batería","Mínimo 4 horas"],["Paciente","Adulto y pediátrico"]],[
 ["Edan","iM8","Vigente","MedTech Andina",4.2e6,7.8e6,2,["ECG, SpO2, PANI, temperatura","8\"","Visuales y sonoras","5 horas","Adulto y pediátrico"]],
 ["Mindray","iMEC8","Vigente","Distrimed SAS",4.8e6,8.5e6,2,["ECG, SpO2, PANI, temperatura","8,4\"","Visuales y sonoras","4 horas","Adulto, pediátrico y neonatal"]],
 ["Contec","CMS8000","Vigente","BioSalud Ltda",3.6e6,6.5e6,1,["ECG, SpO2, PANI, temperatura","8\"","Visuales y sonoras","4 horas","Adulto y pediátrico"]]]),
G("Bomba de infusión","Hospitalización",8,"Equipos de infusión, soporte de pedestal",[["Tipo","Volumétrica"],["Rango de flujo","0,1 a 1200 ml/h"],["Batería","Mínimo 6 horas"],["Biblioteca de fármacos","Mínimo 20 fármacos"],["Alarmas","Oclusión, aire y fin de infusión"]],[
 ["B. Braun","Infusomat Space","Vigente","Distrimed SAS",5e6,9e6,2,["Volumétrica","0,1–1200 ml/h","8 horas","30 fármacos","Oclusión, aire y fin de infusión"]],
 ["Fresenius Kabi","Agilia VP","Vigente","BioSalud Ltda",5.5e6,9.5e6,2,["Volumétrica","0,1–1200 ml/h","6 horas","Hasta 3000 fármacos (Agilia Connect)","Oclusión, aire y fin de infusión"]],
 ["Mindray","BeneFusion VP5","Vigente","MedTech Andina",4.6e6,8.2e6,2,["Volumétrica","0,1–1500 ml/h","6 horas","20 fármacos","Oclusión, aire y fin de infusión"]]]),
G("Lámpara cialítica","Cirugía",12,"Mangos esterilizables",[["Iluminación","Mínimo 100.000 lux"],["Fuente","LED"],["Montaje","Techo, brazo doble"],["Temperatura de color","Entre 4000 y 5000 K"],["Mangos","Esterilizables"]],[
 ["Mediland","LED-500","Vigente","Quirúrgicos del Norte",18e6,32e6,2,["120.000 lux","LED","Techo, brazo doble","4500 K","Esterilizables"]],
 ["Dräger","Polaris 200","Vigente","BioSalud Ltda",24e6,42e6,3,["160.000 lux","LED","Techo, brazo doble","4400 K","Esterilizables"]],
 ["Hillrom","Medilux 500","Vigente","Distrimed SAS",19e6,34e6,2,["130.000 lux","LED","Techo, brazo doble","4300 K","Esterilizables"]]]),
G("Unidad electroquirúrgica","Cirugía",10,"Pedal, electrodos, placa de retorno",[["Potencia","Mínimo 300 W"],["Modos","Monopolar y bipolar"],["Funciones","Corte y coagulación"],["Alarma","Placa de retorno"],["Pantalla","Digital"]],[
 ["Erbe","VIO 3","En renovación","BioSalud Ltda",25e6,48e6,2,["300 W","Monopolar y bipolar","Corte y coagulación","Sí","Táctil digital"]],
 ["Medtronic","ForceTriad","Vigente","Distrimed SAS",30e6,52e6,2,["300 W","Monopolar y bipolar","Corte y coagulación","Sí (Return Electrode Monitoring)","Digital"]],
 ["Bovie","Aaron 3250","Vigente","Quirúrgicos del Norte",22e6,40e6,1,["300 W","Monopolar y bipolar","Corte y coagulación","Sí","Digital"]]]),
G("Analizador de hematología","Laboratorio",8,"Reactivos, controles",[["Parámetros","Mínimo 18 con diferencial de 3 partes"],["Rendimiento","Mínimo 60 muestras/h"],["Volumen de muestra","Máximo 20 µl"],["Memoria","Mínimo 10.000 resultados"],["Interfaz","LIS bidireccional"]],[
 ["Mindray","BC-3000 Plus","Vigente","LabInstrumental",22e6,36e6,2,["19 parámetros, 3 partes","60 muestras/h","13 µl","10.000 resultados","LIS bidireccional"]],
 ["Sysmex","XP-300","Vigente","MedTech Andina",28e6,44e6,2,["20 parámetros, 3 partes","60 muestras/h","25 µl (modo capilar 20 µl)","10.000 resultados","LIS bidireccional"]],
 ["Horiba","ABX Micros 60","Vigente","Distrimed SAS",20e6,33e6,1,["18 parámetros, 3 partes","60 muestras/h","10 µl","10.000 resultados","LIS bidireccional"]]]),
G("Centrífuga clínica","Laboratorio",10,"Rotor, tubos",[["Capacidad","Mínimo 6 tubos"],["Velocidad","Hasta 4000 rpm o más"],["Temporizador","Digital"],["Seguridad","Bloqueo de tapa"],["Ruido","Máximo 60 dB"]],[
 ["Hettich","EBA 200","Vencido","LabInstrumental",2e6,3.8e6,2,["6 tubos","6000 rpm","Digital","Bloqueo de tapa","55 dB"]],
 ["Thermo Scientific","Sorvall ST 8","Vigente","MedTech Andina",4e6,7e6,2,["8 tubos","4000 rpm","Digital","Bloqueo de tapa","55 dB"]],
 ["Eppendorf","5702","Vigente","Distrimed SAS",4.5e6,7.5e6,2,["6 tubos","4400 rpm","Digital","Bloqueo de tapa","56 dB"]]]),
G("Monitor fetal","Obstetricia",8,"Transductores, cintas, gel",[["Parámetros","Doble FCF y TOCO"],["Marcador","De movimientos fetales"],["Pantalla","Mínimo 8\""],["Registro","Impresión térmica"],["Memoria","Almacenamiento interno"]],[
 ["Edan","F3","Vigente","MedTech Andina",6e6,10.5e6,2,["Doble FCF y TOCO","Sí","8\"","Impresión térmica","Sí"]],
 ["Philips","Avalon FM20","Vigente","BioSalud Ltda",9e6,15e6,2,["Doble FCF y TOCO","Sí","8,4\"","Impresión térmica","Sí"]],
 ["Bistos","BT-350","Vigente","Distrimed SAS",5.5e6,9.5e6,1,["Doble FCF y TOCO","Sí","8\"","Impresión térmica","Sí"]]]),
G("Unidad odontológica","Odontología",12,"Compresor, escupidera",[["Sillón","Eléctrico, con memoria de posiciones"],["Jeringa","Triple"],["Iluminación","Lámpara LED"],["Instrumental","Mínimo 3 portainstrumentos"],["Agua","Sistema independiente de agua limpia"]],[
 ["Gnatus","Optimus","Vigente","Dental Andes",15e6,28e6,2,["Eléctrico, 3 memorias","Triple","Lámpara LED","3 portainstrumentos","Sí"]],
 ["Dabi Atlante","Spirit 300","Vigente","Distrimed SAS",14e6,26e6,2,["Eléctrico, 2 memorias","Triple","Lámpara LED","3 portainstrumentos","Sí"]],
 ["Fona","Dental 1000","Vigente","Dental Andes",18e6,32e6,3,["Eléctrico, 3 memorias","Triple","Lámpara LED","4 portainstrumentos","Sí"]]]),
G("Autoclave","Esterilización",12,"Agua destilada, canastillas",[["Capacidad","Mínimo 50 L"],["Ciclos","Programables"],["Tipo","Vapor con secado"],["Registro","Impresora de ciclos"],["Puerta","Con bloqueo de seguridad"]],[
 ["Tuttnauer","2540M","Vigente","Quirúrgicos del Norte",20e6,35e6,2,["65 L","Programables","Vapor con secado","Sí","Bloqueo de seguridad"]],
 ["Sturdy","SA-300VF","Vigente","LabInstrumental",17e6,30e6,2,["60 L","Programables","Vapor con secado","Sí","Bloqueo de seguridad"]],
 ["Getinge","GSS67H","Vigente","BioSalud Ltda",38e6,62e6,3,["67 L","Programables","Vapor con secado","Sí","Bloqueo de seguridad"]]])
];
const CAT=GRUPOS.flatMap((g,gi)=>g.mods.map((m,mi)=>({servicio:g.servicio,equipo:g.equipo,marca:m[0],modelo:m[1],invima:m[2],proveedor:m[3],
  spec:g.req.map((r,i)=>r[0]+': '+m[7][i]).join(', '),req:g.req,val:m[7],pmin:m[4],pmax:m[5],gar:m[6],vida:g.vida,acc:g.acc,fprecio:iso(add(HOY,-15*(gi*3+mi+1)))})));
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
/* Inventario de ejemplo: solo alimenta las alertas de garantía y fin de vida útil y el mapa. */
const INV=Array.from({length:90},(_,i)=>{
  const c=pick(CAT), e=pick(ESE), adq=add(HOY,-(200+Math.floor(R()*365*9)));
  let gar=add(adq,c.gar*365); if(R()<.18) gar=add(HOY,1+Math.floor(R()*28));
  const est=R()<.85?'Operativo':'Fuera de servicio';
  return {id:'EQ-'+String(i+1).padStart(4,'0'),ese:e.ese,sub:e.sub,servicio:c.servicio,equipo:c.equipo,marca:c.marca,modelo:c.modelo,proveedor:c.proveedor,
    adq:iso(adq),fvida:iso(add(adq,c.vida*365)),fgar:iso(gar),estado:est};
});
