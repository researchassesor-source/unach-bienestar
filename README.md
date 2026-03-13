# 🎓 UNACH — Proyecto Integral de Bienestar Estudiantil
## Salud Mental y Actividades Recreativas

Aplicación web para la aplicación del instrumento de bienestar estudiantil, con cálculo automático de baremos e integración con Google Sheets.

---

## 🗂 Estructura del repositorio

```
unach-bienestar/
├── index.html              ← Aplicación principal (encuesta completa)
├── css/
│   └── style.css           ← Estilos (paleta UNACH: rojo, azul, blanco)
├── js/
│   └── survey.js           ← Lógica, baremos y envío a Google Sheets
└── docs/
    └── google-apps-script.js ← Código para el backend en Google Apps Script
```

---

## 🚀 Guía de configuración paso a paso

### PASO 1 — Crear el Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com) y crea una nueva hoja.
2. Llámala **"Bienestar UNACH 2026"** (o el nombre que prefieras).
3. Copia el **ID** desde la URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
   ```

---

### PASO 2 — Configurar Google Apps Script

1. Ve a [script.google.com](https://script.google.com) → **Nuevo proyecto**.
2. Borra el código vacío y pega el contenido completo de `docs/google-apps-script.js`.
3. En la línea 28, reemplaza:
   ```javascript
   const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';
   ```
   con el ID que copiaste en el paso anterior.
4. Guarda el proyecto (Ctrl+S). Dale un nombre como **"UNACH Bienestar API"**.
5. Haz clic en **Implementar → Nueva implementación**:
   - Tipo: **Aplicación web**
   - Descripción: `v1.0`
   - Ejecutar como: **Yo** (tu cuenta de Google)
   - Quién tiene acceso: **Cualquier usuario**
6. Haz clic en **Implementar** y autoriza los permisos que solicita.
7. **Copia la URL** que aparece (tiene este formato):
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

### PASO 3 — Conectar la app con el script

Abre `js/survey.js` y en la línea 6 reemplaza:

```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID_AQUI/exec';
```

por la URL que copiaste en el paso anterior.

---

### PASO 4 — Publicar en GitHub Pages

1. Crea una cuenta en [github.com](https://github.com) si no tienes una.
2. Crea un nuevo repositorio público llamado `unach-bienestar`.
3. Sube todos los archivos:
   ```bash
   git init
   git add .
   git commit -m "Primera versión de la encuesta UNACH Bienestar 2026"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/unach-bienestar.git
   git push -u origin main
   ```
4. En tu repositorio de GitHub, ve a **Settings → Pages**.
5. En **Source**, selecciona la rama `main` y la carpeta `/ (root)`.
6. Haz clic en **Save**.
7. En unos minutos la app estará disponible en:
   ```
   https://TU_USUARIO.github.io/unach-bienestar/
   ```

---

## 📊 Cómo se almacenan los datos en Google Sheets

Cada respuesta genera **una fila** con:

| Grupo | Contenido |
|-------|-----------|
| Metadatos | Timestamp, ID anónimo, duración, consentimiento |
| Respuestas crudas | Todas las respuestas de los bloques A–P |
| Puntajes calculados | `score_B`, `score_PHQ9`, `score_GAD7`, `score_WHO5`, `score_MOS`, `score_E`, `score_H`, `score_K`, `score_L`, `igbe` |
| Categorías baremo | Interpretación textual de cada puntaje |
| Alertas | Flags de ideación suicida, depresión severa, ansiedad grave |

### Hojas creadas automáticamente:
- **`Respuestas`** — Todos los registros (filas rojas = alertas activas)
- **`Alertas`** — Solo los registros que requieren atención inmediata

---

## ⚖️ Protección de datos (LOPDP Ecuador)

La app incluye el aviso legal correspondiente a la **Ley Orgánica de Protección de Datos Personales del Ecuador**. El consentimiento informado se registra en cada respuesta.

- Los datos se almacenan exclusivamente en el Google Sheet del investigador.
- No se utilizan servicios de analytics ni cookies de terceros.
- El estudiante puede solicitar la eliminación de sus datos contactando a `bienestar@unach.edu.ec`.

---

## 🆘 Alertas automáticas

Las siguientes situaciones generan una fila roja en Google Sheets y se registran en la hoja **Alertas**:

| Condición | Indicador |
|-----------|-----------|
| Ideación suicida pasiva | G1 = 1 |
| Ideación suicida activa | G2 = 1 ⚠ URGENTE |
| Antecedente de intento | G3 = 1 |
| Depresión severa | PHQ-9 ≥ 20 |
| Ansiedad grave | GAD-7 ≥ 15 |
| IGBE crítico | Puntaje < 25 |

---

## 🛠 Actualizar la app después de cambios

Cada vez que modifiques el código:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

GitHub Pages se actualizará automáticamente en 1–2 minutos.

---

## 📬 Contacto

Universidad Nacional de Chimborazo — Equipo de Bienestar Estudiantil  
📧 bienestar@unach.edu.ec
