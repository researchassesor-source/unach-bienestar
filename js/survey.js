/* ═══════════════════════════════════════════════════
   UNACH · Proyecto Integral de Bienestar Estudiantil
   survey.js — lógica de encuesta, baremo y envío
═══════════════════════════════════════════════════ */

// ── CONFIGURACIÓN ─────────────────────────────────
// 🔧 REEMPLAZA esta URL con tu Web App URL de Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyP9gGmcHGUgYdqtosrskW4TEEx7ENm5g-GNNPG8ssQXjPzSyR5dzFTQjaY6eVx85VWFA/exec';

// ── SECUENCIA DE PANTALLAS ─────────────────────────
const SCREENS = [
  'screen-welcome','screen-consent',
  'screen-A','screen-B','screen-C','screen-D','screen-E',
  'screen-F','screen-G','screen-H','screen-I',
  'screen-J','screen-K','screen-L','screen-M',
  'screen-N','screen-O','screen-P',
  'screen-final','screen-sending','screen-results'
];

const SCREEN_LABELS = {
  'screen-welcome':  'Bienvenida',
  'screen-consent':  'Consentimiento',
  'screen-A': 'Bloque A — Sociodemográficos',
  'screen-B': 'Bloque B — Adaptación Académica',
  'screen-C': 'Bloque C — Salud Mental',
  'screen-D': 'Bloque D — Bienestar y Apoyo',
  'screen-E': 'Bloque E — Estrés y Vivienda',
  'screen-F': 'Bloque F — Recreación',
  'screen-G': 'Bloque G — Ideación Suicida',
  'screen-H': 'Bloque H — Sustancias',
  'screen-I': 'Bloque I — Violencia',
  'screen-J': 'Bloque J — Capital Académico',
  'screen-K': 'Bloque K — Integración',
  'screen-L': 'Bloque L — Capital Psicológico',
  'screen-M': 'Bloque M — Empleabilidad',
  'screen-N': 'Bloque N — Entorno Digital',
  'screen-O': 'Bloque O — Salud Física',
  'screen-P': 'Bloque P — Gestión del Tiempo',
  'screen-final': 'Comentario Final',
};

let currentScreen = 'screen-welcome';
let startTime = Date.now();

// ── NAVEGACIÓN ─────────────────────────────────────
function goToScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  currentScreen = id;
  updateProgress(id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(screenId) {
  const surveyScreens = SCREENS.filter(s =>
    s !== 'screen-welcome' && s !== 'screen-sending' && s !== 'screen-results'
  );
  const idx = surveyScreens.indexOf(screenId);
  const pct = idx < 0 ? 0 : Math.round((idx / (surveyScreens.length - 1)) * 100);
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressLabel').textContent =
    SCREEN_LABELS[screenId] || (pct === 100 ? 'Completado' : `${pct}%`);
}

function nextBlock(from, to) {
  goToScreen(to);
}

// ── CONSENTIMIENTO ─────────────────────────────────
function handleConsent(radio) {
  if (radio.value === 'no') {
    document.getElementById('consent-no-msg').style.display = 'block';
    document.getElementById('modalidad-group').style.display = 'none';
    document.getElementById('consent-nav').style.display = 'none';
  } else {
    document.getElementById('consent-no-msg').style.display = 'none';
    document.getElementById('modalidad-group').style.display = 'block';
    document.getElementById('consent-nav').style.display = 'flex';
  }
}

function startSurvey() {
  const modalidad = document.querySelector('input[name="modalidad"]:checked');
  if (!modalidad) {
    alert('Por favor selecciona una modalidad de participación antes de continuar.');
    return;
  }
  startTime = Date.now();
  goToScreen('screen-A');
}

// ── RENDER HELPERS ─────────────────────────────────
function renderLikertTable(containerId, items, numOptions, startVal = 0) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // header row ya está o se crea dinámicamente
  if (!container.querySelector('.lt-header')) {
    const hdr = document.createElement('div');
    hdr.className = 'lt-header';
    const qDiv = document.createElement('div');
    qDiv.className = 'lt-q';
    qDiv.textContent = 'Afirmación';
    hdr.appendChild(qDiv);
    const optsDiv = document.createElement('div');
    optsDiv.className = 'lt-opts';
    for (let i = startVal; i < startVal + numOptions; i++) {
      const sp = document.createElement('span');
      sp.textContent = i;
      optsDiv.appendChild(sp);
    }
    hdr.appendChild(optsDiv);
    container.appendChild(hdr);
  }

  items.forEach(([name, text, note, isInverse]) => {
    const row = document.createElement('div');
    row.className = 'lt-row';
    row.dataset.name = name;

    const qDiv = document.createElement('div');
    qDiv.className = 'lt-qtext';
    qDiv.innerHTML = `<strong>${text}</strong>`;
    if (note) qDiv.innerHTML += `<small>${note}</small>`;
    if (isInverse) qDiv.innerHTML += `<small style="color:#B45309"> ⟲ Ítem inverso</small>`;
    row.appendChild(qDiv);

    const optsDiv = document.createElement('div');
    optsDiv.className = 'lt-opts-row';

    for (let i = startVal; i < startVal + numOptions; i++) {
      const lbl = document.createElement('label');
      const inp = document.createElement('input');
      inp.type = 'radio';
      inp.name = name;
      inp.value = i;
      inp.addEventListener('change', () => {
        row.classList.add('answered');
      });
      const dot = document.createElement('div');
      dot.className = 'lt-dot';
      dot.textContent = i;
      lbl.appendChild(inp);
      lbl.appendChild(dot);
      optsDiv.appendChild(lbl);
    }

    row.appendChild(optsDiv);
    container.appendChild(row);
  });
}

function renderLikertScale(el) {
  const name = el.dataset.name;
  const labels = el.dataset.labels.split(',');
  const values = el.dataset.values.split(',');
  el.classList.add('likert-scale');

  labels.forEach((lbl, i) => {
    const opt = document.createElement('label');
    opt.className = 'ls-opt';
    const inp = document.createElement('input');
    inp.type = 'radio';
    inp.name = name;
    inp.value = values[i];
    const pill = document.createElement('div');
    pill.className = 'ls-pill';
    const num = document.createElement('div');
    num.className = 'ls-num';
    num.textContent = values[i];
    const txt = document.createElement('div');
    txt.className = 'ls-text';
    txt.textContent = lbl;
    pill.appendChild(num);
    pill.appendChild(txt);
    opt.appendChild(inp);
    opt.appendChild(pill);
    el.appendChild(opt);
  });
}

function renderYesNoTable(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  items.forEach(([name, text]) => {
    const row = document.createElement('div');
    row.className = 'yn-row';

    const qDiv = document.createElement('div');
    qDiv.className = 'yn-qtext';
    qDiv.textContent = text;
    row.appendChild(qDiv);

    const radiosDiv = document.createElement('div');
    radiosDiv.className = 'yn-radios';

    ['0','1'].forEach(val => {
      const lbl = document.createElement('label');
      const inp = document.createElement('input');
      inp.type = 'radio';
      inp.name = name;
      inp.value = val;
      const dot = document.createElement('div');
      dot.className = 'yn-dot';
      lbl.appendChild(inp);
      lbl.appendChild(dot);
      radiosDiv.appendChild(lbl);
    });

    row.appendChild(radiosDiv);
    container.appendChild(row);
  });
}

// ── RECOLECCIÓN DE DATOS ───────────────────────────
function collectData() {
  const data = {};

  // timestamp & metadata
  data.timestamp = new Date().toISOString();
  data.duracion_seg = Math.round((Date.now() - startTime) / 1000);
  data.id_anonimo = Math.random().toString(36).substr(2, 8).toUpperCase();

  // consent
  const consent = document.querySelector('input[name="consent"]:checked');
  data.consentimiento = consent ? consent.value : '';
  const modalidad = document.querySelector('input[name="modalidad"]:checked');
  data.modalidad = modalidad ? modalidad.value : '';

  // text inputs
  ['A1','A6','A7','F3','O1'].forEach(id => {
    const el = document.getElementById(id);
    data[id] = el ? el.value : '';
  });

  // radio inputs
  const radioNames = [
    'A2','A3','A4','A5','A8','A9','A10',
    'B6','B7',
    'F2','F4',
    'G1','G2','G3',
    'I4',
    'J1','J2','J3','J4',
    'K5',
    'M10',
    'O2',
    // likert tables
    'A12',
    'B1','B2','B3','B4','B5',
    'C1','C2','C3','C4','C5','C6','C7','C8','C9',
    'C10','C11','C12','C13','C14','C15','C16',
    'D1','D2','D3','D4','D5',
    'D6','D7','D8','D9',
    'E1','E2','E3','E4',
    'F1',
    'H1','H2','H3','H4','H5','H6','H7','H8',
    'I1','I2','I3',
    'J5','J6',
    'K1','K2','K3','K4',
    'L1','L2','L3','L4',
    'M1','M2','M3','M4','M5','M6','M7','M8','M9',
    'N1','N2','N3','N4','N5',
    'O3','O4','O5',
    'P1','P2','P3','P4',
  ];

  radioNames.forEach(name => {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    data[name] = el ? el.value : '';
  });

  // checkboxes (multi)
  ['A11','F5'].forEach(name => {
    const checked = [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(e => e.value);
    data[name] = checked.join(' | ');
  });

  // sliders
  ['F6','F7','I5'].forEach(id => {
    const el = document.getElementById(id);
    data[id] = el ? el.value : '';
  });

  // comment
  const comentario = document.getElementById('comentario');
  data.comentario = comentario ? comentario.value : '';

  return data;
}

// ── CÁLCULO DE BAREMOS ─────────────────────────────
function calcBaremos(d) {
  const n = v => parseInt(v) || 0;
  const inv4 = v => 4 - n(v);  // inverso escala 0–4
  const inv3 = v => 3 - n(v);  // inverso escala 0–3

  // ── BLOQUE B: Adaptación Académica (0–20) ────────
  const scoreB = n(d.B1) + inv4(d.B2) + inv4(d.B3) + n(d.B4) + n(d.B5);
  const barB = scoreB >= 16 ? {cat:'Alto rendimiento adaptativo', action:'Sin intervención requerida.', level:'ok'}
             : scoreB >= 11 ? {cat:'Adaptación moderada', action:'Seguimiento preventivo recomendado.', level:'warn'}
             : scoreB >= 6  ? {cat:'Adaptación baja', action:'Se sugiere apoyo académico.', level:'alert'}
             :                {cat:'Adaptación muy baja', action:'Intervención prioritaria.', level:'crisis'};

  // ── PHQ-9 Depresión (0–27) ──────────────────────
  const phq = ['C1','C2','C3','C4','C5','C6','C7','C8','C9'].reduce((s,k)=>s+n(d[k]),0);
  const barPHQ = phq <= 4  ? {cat:'Sin depresión', action:'Sin síntomas clínicamente relevantes.', level:'ok'}
               : phq <= 9  ? {cat:'Depresión mínima', action:'Psicoeducación preventiva.', level:'ok'}
               : phq <= 14 ? {cat:'Depresión leve', action:'Orientación psicológica recomendada.', level:'warn'}
               : phq <= 19 ? {cat:'Depresión moderada', action:'Derivación a salud mental.', level:'alert'}
               :             {cat:'Depresión severa', action:'⚠ Derivación urgente a psicología.', level:'crisis'};

  // ── GAD-7 Ansiedad (0–21) ───────────────────────
  const gad = ['C10','C11','C12','C13','C14','C15','C16'].reduce((s,k)=>s+n(d[k]),0);
  const barGAD = gad <= 4  ? {cat:'Sin ansiedad', action:'Sin síntomas relevantes.', level:'ok'}
               : gad <= 9  ? {cat:'Ansiedad leve', action:'Manejo del estrés preventivo.', level:'warn'}
               : gad <= 14 ? {cat:'Ansiedad moderada', action:'Orientación psicológica.', level:'alert'}
               :             {cat:'Ansiedad grave', action:'⚠ Derivación urgente.', level:'crisis'};

  // ── WHO-5 Bienestar (puntaje × 5 = 0–100) ───────
  const who5_bruto = ['D1','D2','D3','D4','D5'].reduce((s,k)=>s+n(d[k]),0);
  const who5 = who5_bruto * 5;
  const barWHO = who5 >= 68 ? {cat:'Bienestar óptimo', action:'Estado emocional positivo.', level:'ok'}
               : who5 >= 52 ? {cat:'Bienestar moderado', action:'Monitoreo preventivo.', level:'warn'}
               : who5 >= 28 ? {cat:'Bienestar bajo', action:'Orientación psicológica sugerida.', level:'alert'}
               :              {cat:'Posible depresión activa', action:'⚠ Aplicar PHQ-9 completo.', level:'crisis'};

  // ── MOS Apoyo Social (4–20) ──────────────────────
  const mos = ['D6','D7','D8','D9'].reduce((s,k)=>s+n(d[k]),0);
  const barMOS = mos >= 17 ? {cat:'Apoyo social alto', action:'Red de apoyo sólida.', level:'ok'}
               : mos >= 12 ? {cat:'Apoyo social moderado', action:'Fortalecer red de apoyo.', level:'warn'}
               :             {cat:'Apoyo social bajo', action:'Aislamiento social probable.', level:'alert'};

  // ── Bloque E Estrés (0–16) ──────────────────────
  const estres = ['E1','E2','E3','E4'].reduce((s,k)=>s+n(d[k]),0);
  const barE = estres <= 3  ? {cat:'Sin estrés contextual', action:'Condiciones adecuadas.', level:'ok'}
             : estres <= 7  ? {cat:'Estrés leve', action:'Monitoreo preventivo.', level:'warn'}
             : estres <= 11 ? {cat:'Estrés moderado', action:'Articular con bienestar.', level:'alert'}
             :                {cat:'Estrés alto', action:'Intervención social prioritaria.', level:'crisis'};

  // ── Bloque G Ideación suicida ────────────────────
  const g1=n(d.G1), g2=n(d.G2), g3=n(d.G3);
  const barG = (g2===1) ? {cat:'Ideación activa', action:'⚠ ATENCIÓN URGENTE requerida.', level:'crisis'}
             : (g1===1) ? {cat:'Ideación pasiva', action:'⚠ Evaluación de riesgo inmediata.', level:'crisis'}
             : (g3===1) ? {cat:'Antecedente de intento', action:'⚠ Seguimiento intensivo.', level:'crisis'}
             :            {cat:'Sin ideación reportada', action:'Sin alerta activa.', level:'ok'};

  // ── Bloque H Sustancias Secc.1 (0–20) ───────────
  const hFreq = ['H1','H2','H3','H4','H5'].reduce((s,k)=>s+n(d[k]),0);
  const barH = hFreq <= 2  ? {cat:'Sin uso o uso mínimo', action:'Sin indicador de riesgo.', level:'ok'}
             : hFreq <= 7  ? {cat:'Uso ocasional', action:'Psicoeducación sobre riesgos.', level:'warn'}
             : hFreq <= 13 ? {cat:'Uso frecuente', action:'Intervención breve.', level:'alert'}
             :               {cat:'Uso problemático', action:'Derivar a servicio especializado.', level:'crisis'};

  // ── Bloque K Integración (0–16) ─────────────────
  const integ = ['K1','K2','K3','K4'].reduce((s,k)=>s+n(d[k]),0);
  const barK = integ >= 13 ? {cat:'Integración alta', action:'Fuerte sentido de pertenencia.', level:'ok'}
             : integ >= 8  ? {cat:'Integración media', action:'Fortalecer participación.', level:'warn'}
             :               {cat:'Integración baja', action:'Riesgo de desvinculación.', level:'alert'};

  // ── Bloque L Capital Psicológico (0–16) ─────────
  const capPsi = ['L1','L2','L3','L4'].reduce((s,k)=>s+n(d[k]),0);
  const barL = capPsi >= 13 ? {cat:'Capital psicológico alto', action:'Alta resiliencia.', level:'ok'}
             : capPsi >= 8  ? {cat:'Capital psicológico medio', action:'Fortalecer regulación emocional.', level:'warn'}
             :                {cat:'Capital psicológico bajo', action:'Apoyo socioemocional sugerido.', level:'alert'};

  // ── IGBE — Índice Global de Bienestar (0–100) ────
  // Normaliza cada dimensión a 0–100 y aplica pesos
  const norm = (val, min, max) => Math.round(((val - min) / (max - min)) * 100);
  const igbe_dims = {
    salud_mental: 100 - norm((phq / 27 + gad / 21) / 2 * 100, 0, 100), // inverso: más alto = mejor
    bienestar:    who5,
    adaptacion:   norm(scoreB, 0, 20) * 100 / 100,
    apoyo:        norm(mos, 4, 20) * 100 / 100,
    cap_psi:      norm(capPsi, 0, 16) * 100 / 100,
    salud_fisica: norm(['O4','O5'].reduce((s,k)=>s+n(d[k]),0) + inv4(d.O3), 0, 12) * 100 / 100,
    estres_inv:   100 - norm(estres, 0, 16) * 100 / 100,
  };

  const pesos = { salud_mental:.25, bienestar:.20, adaptacion:.15, apoyo:.15, cap_psi:.10, salud_fisica:.10, estres_inv:.05 };
  const igbe = Math.round(
    Object.keys(pesos).reduce((s, k) => {
      const v = igbe_dims[k];
      const norm100 = typeof v === 'number' ? (v > 1 ? v : v * 100) : 0;
      return s + norm100 * pesos[k];
    }, 0)
  );

  const barIGBE = igbe >= 75 ? {cat:'Bienestar estudiantil alto', desc:'Sin riesgo sistémico. Seguimiento anual.', level:'ok'}
                : igbe >= 50 ? {cat:'Bienestar estudiantil moderado', desc:'Seguimiento semestral. Intervenciones preventivas.', level:'warn'}
                : igbe >= 25 ? {cat:'Bienestar estudiantil bajo', desc:'Intervención activa multi-área.', level:'alert'}
                :              {cat:'Bienestar estudiantil crítico', desc:'⚠ Protocolo de crisis. Derivación inmediata.', level:'crisis'};

  return {
    scoreB, phq, gad, who5, mos, estres, hFreq, integ, capPsi, igbe,
    barB, barPHQ, barGAD, barWHO, barMOS, barE, barG, barH, barK, barL, barIGBE,
    alertas: {
      ideacion: barG.level === 'crisis',
      depresion_severa: barPHQ.level === 'crisis',
      ansiedad_grave: barGAD.level === 'crisis',
      bienestar_critico: barIGBE.level === 'crisis',
    }
  };
}

// ── RENDER RESULTADOS ──────────────────────────────
function renderResults(baremos) {
  const c = document.getElementById('resultsContent');

  // IGBE global
  const ib = baremos.barIGBE;
  c.innerHTML = `
    <div class="igbe-box ${ib.level}">
      <div class="igbe-title">Índice Global de Bienestar Estudiantil</div>
      <div class="igbe-score">${baremos.igbe}</div>
      <div class="igbe-cat">${ib.cat}</div>
      <div class="igbe-desc">${ib.desc}</div>
    </div>
    <div class="baremo-grid" id="baremoGrid"></div>
  `;

  const grid = document.getElementById('baremoGrid');
  const cards = [
    {label:'Depresión (PHQ-9)', score: baremos.phq + '/27', bar: baremos.barPHQ},
    {label:'Ansiedad (GAD-7)',  score: baremos.gad + '/21', bar: baremos.barGAD},
    {label:'Bienestar (WHO-5)', score: baremos.who5 + '/100', bar: baremos.barWHO},
    {label:'Apoyo Social (MOS)', score: baremos.mos + '/20', bar: baremos.barMOS},
    {label:'Adaptación Académica', score: baremos.scoreB + '/20', bar: baremos.barB},
    {label:'Estrés Contextual', score: baremos.estres + '/16', bar: baremos.barE},
    {label:'Ideación Suicida',  score: '—', bar: baremos.barG},
    {label:'Sustancias',        score: baremos.hFreq + '/20', bar: baremos.barH},
    {label:'Integración Inst.', score: baremos.integ + '/16', bar: baremos.barK},
    {label:'Capital Psicológico', score: baremos.capPsi + '/16', bar: baremos.barL},
  ];

  cards.forEach(({label, score, bar}) => {
    grid.innerHTML += `
      <div class="baremo-card ${bar.level}">
        <div class="baremo-block">${label}</div>
        <div class="baremo-score">${score}</div>
        <div class="baremo-label">${bar.cat}</div>
        <div class="baremo-action">${bar.action}</div>
      </div>
    `;
  });

  // Alertas activas
  if (Object.values(baremos.alertas).some(Boolean)) {
    const alertBox = document.createElement('div');
    alertBox.style.cssText = 'background:#FEE2E2;border:2px solid #C8102E;border-radius:10px;padding:18px 22px;margin:16px 0;font-size:14px;color:#7F1D1D;';
    alertBox.innerHTML = '<strong>⚠ ALERTAS ACTIVAS — Requieren atención inmediata:</strong><ul style="padding-left:18px;margin-top:8px">';
    if (baremos.alertas.ideacion) alertBox.innerHTML += '<li>Ideación o conducta suicida reportada</li>';
    if (baremos.alertas.depresion_severa) alertBox.innerHTML += '<li>Depresión severa (PHQ-9 ≥ 20)</li>';
    if (baremos.alertas.ansiedad_grave) alertBox.innerHTML += '<li>Ansiedad grave (GAD-7 ≥ 15)</li>';
    if (baremos.alertas.bienestar_critico) alertBox.innerHTML += '<li>Índice global de bienestar crítico</li>';
    alertBox.innerHTML += '</ul>';
    c.insertBefore(alertBox, c.querySelector('.baremo-grid'));
  }
}

// ── ENVÍO ──────────────────────────────────────────
async function submitSurvey() {
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const data = collectData();
  const baremos = calcBaremos(data);

  // Agrega puntajes calculados al payload
  data.score_B    = baremos.scoreB;
  data.score_PHQ9 = baremos.phq;
  data.score_GAD7 = baremos.gad;
  data.score_WHO5 = baremos.who5;
  data.score_MOS  = baremos.mos;
  data.score_E    = baremos.estres;
  data.score_H    = baremos.hFreq;
  data.score_K    = baremos.integ;
  data.score_L    = baremos.capPsi;
  data.igbe       = baremos.igbe;

  data.cat_B    = baremos.barB.cat;
  data.cat_PHQ9 = baremos.barPHQ.cat;
  data.cat_GAD7 = baremos.barGAD.cat;
  data.cat_WHO5 = baremos.barWHO.cat;
  data.cat_MOS  = baremos.barMOS.cat;
  data.cat_E    = baremos.barE.cat;
  data.cat_G    = baremos.barG.cat;
  data.cat_H    = baremos.barH.cat;
  data.cat_K    = baremos.barK.cat;
  data.cat_L    = baremos.barL.cat;
  data.cat_IGBE = baremos.barIGBE.cat;

  data.alerta_ideacion         = baremos.alertas.ideacion ? '⚠ SÍ' : 'No';
  data.alerta_depresion_severa = baremos.alertas.depresion_severa ? '⚠ SÍ' : 'No';
  data.alerta_ansiedad_grave   = baremos.alertas.ansiedad_grave ? '⚠ SÍ' : 'No';

  goToScreen('screen-sending');

  // Envío mediante iframe oculto para evitar bloqueos CORS de GitHub Pages
  sendViaIframe(data, baremos);
}

function sendViaIframe(data, baremos) {
  // Crea un iframe invisible que absorbe la redirección de Apps Script
  const iframeName = 'hidden_submit_' + Date.now();
  const iframe = document.createElement('iframe');
  iframe.name = iframeName;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Crea un formulario oculto que envía a Apps Script como GET con parámetro payload
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = GOOGLE_SCRIPT_URL;
  form.target = iframeName;
  form.style.display = 'none';

  // Apps Script recibirá los datos como e.parameter.payload
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'payload';
  input.value = JSON.stringify(data);
  form.appendChild(input);

  document.body.appendChild(form);

  // Cuando el iframe cargue = Apps Script respondió = éxito
  let done = false;
  iframe.onload = () => {
    if (done) return;
    done = true;
    cleanup();
    goToScreen('screen-results');
    renderResults(baremos);
  };

  // Timeout de seguridad: si en 12 segundos no responde, mostramos resultados igual
  const timeout = setTimeout(() => {
    if (done) return;
    done = true;
    cleanup();
    goToScreen('screen-results');
    renderResults(baremos);
  }, 12000);

  function cleanup() {
    clearTimeout(timeout);
    try { document.body.removeChild(form); } catch(e) {}
    setTimeout(() => { try { document.body.removeChild(iframe); } catch(e) {} }, 2000);
  }

  form.submit();
}

// ── INIT ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Render likert scales (data-* driven)
  document.querySelectorAll('[data-name]').forEach(el => {
    if (el.dataset.labels) renderLikertScale(el);
  });

  updateProgress('screen-welcome');
});
