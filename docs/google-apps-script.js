// ═══════════════════════════════════════════════════════════════
//  UNACH · Proyecto Integral de Bienestar Estudiantil
//  Google Apps Script — Receptor de encuestas
//
//  INSTRUCCIONES:
//  1. Abre script.google.com → Nuevo proyecto
//  2. Pega este código completo
//  3. Cambia SPREADSHEET_ID por el ID de tu Google Sheet
//  4. Despliega: Implementar → Nueva implementación
//     · Tipo: Aplicación web
//     · Ejecutar como: Yo (tu cuenta)
//     · Quién tiene acceso: Cualquier usuario
//  5. Copia la URL generada y pégala en js/survey.js → GOOGLE_SCRIPT_URL
// ═══════════════════════════════════════════════════════════════

// 🔧 REEMPLAZA con el ID de tu Google Sheet
// (está en la URL: docs.google.com/spreadsheets/d/ESTE_ID/edit)
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';

// Nombre de la hoja donde se guardarán los datos crudos
const SHEET_RAW  = 'Respuestas';
// Nombre de la hoja de alertas
const SHEET_ALERT = 'Alertas';

// ── Columnas en el orden que se almacenarán ─────────────────────
const COLUMNS = [
  // Metadata
  'timestamp','duracion_seg','id_anonimo','consentimiento','modalidad',
  // Bloque A
  'A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','A12',
  // Bloque B
  'B1','B2','B3','B4','B5','B6','B7',
  // Bloque C – PHQ9
  'C1','C2','C3','C4','C5','C6','C7','C8','C9',
  // Bloque C – GAD7
  'C10','C11','C12','C13','C14','C15','C16',
  // Bloque D
  'D1','D2','D3','D4','D5','D6','D7','D8','D9',
  // Bloque E
  'E1','E2','E3','E4',
  // Bloque F
  'F1','F2','F3','F4','F5','F6','F7',
  // Bloque G
  'G1','G2','G3',
  // Bloque H
  'H1','H2','H3','H4','H5','H6','H7','H8',
  // Bloque I
  'I1','I2','I3','I4','I5',
  // Bloque J
  'J1','J2','J3','J4','J5','J6',
  // Bloque K
  'K1','K2','K3','K4','K5',
  // Bloque L
  'L1','L2','L3','L4',
  // Bloque M
  'M1','M2','M3','M4','M5','M6','M7','M8','M9','M10',
  // Bloque N
  'N1','N2','N3','N4','N5',
  // Bloque O
  'O1','O2','O3','O4','O5',
  // Bloque P
  'P1','P2','P3','P4',
  // Comentario
  'comentario',
  // Puntajes calculados
  'score_B','score_PHQ9','score_GAD7','score_WHO5','score_MOS',
  'score_E','score_H','score_K','score_L','igbe',
  // Categorías baremo
  'cat_B','cat_PHQ9','cat_GAD7','cat_WHO5','cat_MOS',
  'cat_E','cat_G','cat_H','cat_K','cat_L','cat_IGBE',
  // Alertas
  'alerta_ideacion','alerta_depresion_severa','alerta_ansiedad_grave',
];

// ── doPost: recibe los datos de la encuesta ─────────────────────
function doPost(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    let data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // ── Hoja de respuestas crudas ────────────────
    let rawSheet = ss.getSheetByName(SHEET_RAW);
    if (!rawSheet) {
      rawSheet = ss.insertSheet(SHEET_RAW);
      // Crea encabezados
      rawSheet.appendRow(COLUMNS);
      // Formato del encabezado
      const hdrRange = rawSheet.getRange(1, 1, 1, COLUMNS.length);
      hdrRange.setBackground('#003087');
      hdrRange.setFontColor('#FFFFFF');
      hdrRange.setFontWeight('bold');
      hdrRange.setFontSize(10);
      rawSheet.setFrozenRows(1);
    }

    // Construye la fila en el orden de COLUMNS
    const row = COLUMNS.map(col => {
      const val = data[col];
      return val !== undefined && val !== null ? val : '';
    });

    rawSheet.appendRow(row);

    // ── Hoja de alertas ──────────────────────────
    const tieneAlerta = data.alerta_ideacion === '⚠ SÍ'
                     || data.alerta_depresion_severa === '⚠ SÍ'
                     || data.alerta_ansiedad_grave === '⚠ SÍ'
                     || (data.cat_IGBE || '').includes('crítico');

    if (tieneAlerta) {
      let alertSheet = ss.getSheetByName(SHEET_ALERT);
      if (!alertSheet) {
        alertSheet = ss.insertSheet(SHEET_ALERT);
        const alertCols = ['Fecha','ID Anónimo','IGBE','Cat. IGBE','Alerta Ideación',
                           'Alerta Depresión','Alerta Ansiedad','PHQ-9','GAD-7','WHO-5','Acción'];
        alertSheet.appendRow(alertCols);
        const aHdr = alertSheet.getRange(1, 1, 1, alertCols.length);
        aHdr.setBackground('#C8102E');
        aHdr.setFontColor('#FFFFFF');
        aHdr.setFontWeight('bold');
        alertSheet.setFrozenRows(1);
      }
      alertSheet.appendRow([
        data.timestamp || '',
        data.id_anonimo || '',
        data.igbe || '',
        data.cat_IGBE || '',
        data.alerta_ideacion || '',
        data.alerta_depresion_severa || '',
        data.alerta_ansiedad_grave || '',
        data.score_PHQ9 || '',
        data.score_GAD7 || '',
        data.score_WHO5 || '',
        'REVISAR — Contactar a Bienestar Estudiantil UNACH'
      ]);

      // Colorea la fila de alerta en rojo claro
      const lastAlert = alertSheet.getLastRow();
      alertSheet.getRange(lastAlert, 1, 1, 11).setBackground('#FEE2E2');
    }

    // ── Colorea alertas en hoja principal ────────
    if (tieneAlerta) {
      const lastRow = rawSheet.getLastRow();
      rawSheet.getRange(lastRow, 1, 1, COLUMNS.length).setBackground('#FEE2E2');
    }

    return ContentService
      .createTextOutput(JSON.stringify({status:'ok', id: data.id_anonimo || ''}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'error', message: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── doGet: responde a preflight/verificación ────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status:'ok', app:'UNACH Proyecto Integral de Bienestar Estudiantil'}))
    .setMimeType(ContentService.MimeType.JSON);
}
