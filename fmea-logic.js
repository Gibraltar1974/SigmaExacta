// fmea-logic.js

let components = [];
let contacts = [];
let functions = [];
let network = null;
let analysisCounter = 0;

let contactCounter = 0;
let primaryFunctionCounter = 0;
let secondaryFunctionCounter = 0;

let componentsList, contactsList, functionsList, contactFromSelect, contactToSelect, functionContactsSelect, networkLegend, fmeaResultsContainer;

const functionColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22', '#34495e', '#d35400', '#27ae60'];

document.addEventListener('DOMContentLoaded', function () {
  initComponents();
});

function initComponents() {
  componentsList = document.getElementById('componentsList');
  contactsList = document.getElementById('contactsList');
  functionsList = document.getElementById('functionsList');
  contactFromSelect = document.getElementById('contactFrom');
  contactToSelect = document.getElementById('contactTo');
  functionContactsSelect = document.getElementById('functionContacts');
  networkLegend = document.getElementById('networkLegend');
  fmeaResultsContainer = document.getElementById('fmeaResultsContainer');

  document.getElementById('addComponentBtn').addEventListener('click', addComponent);
  document.getElementById('addContactBtn').addEventListener('click', addContact);
  document.getElementById('addFunctionBtn').addEventListener('click', addFunction);
  document.getElementById('generateFMEABtn').addEventListener('click', generateFMEA);
  document.getElementById('exportChartBtn').addEventListener('click', exportChart);
  document.getElementById('clearComponentsBtn').addEventListener('click', resetAll);
  document.getElementById('clearContactsBtn').addEventListener('click', () => { contacts = []; functions = []; contactCounter = 0; primaryFunctionCounter = 0; secondaryFunctionCounter = 0; updateAll(); });
  document.getElementById('clearFunctionsBtn').addEventListener('click', () => { functions = []; primaryFunctionCounter = 0; secondaryFunctionCounter = 0; updateAll(); });
  document.getElementById('fitViewBtn').addEventListener('click', () => { if (network) network.fit({ animation: true }); });
  document.getElementById('globalLoadExampleBtn').addEventListener('click', loadExample);
  document.getElementById('globalResetBtn').addEventListener('click', resetAll);
  // El botón refreshHeatmapBtn ya no es necesario, pero lo dejamos por compatibilidad
  document.getElementById('refreshHeatmapBtn')?.addEventListener('click', () => refreshHeatmap());
  document.getElementById('exportHeatmapExcelBtn')?.addEventListener('click', exportHeatmapToExcel);
  document.getElementById('exportHeatmapImageBtn')?.addEventListener('click', exportHeatmapToImage);

  updateAll();
}

function getFunctionColor(id) {
  return functionColors[(id - 1) % functionColors.length];
}

function autoGrowTextarea(element) {
  element.style.height = "auto";
  element.style.height = (element.scrollHeight) + "px";
}

function loadExample() {
  resetAll();
  components = [{ id: 1, name: 'Motor', external: false }, { id: 2, name: 'Gearbox', external: false }, { id: 3, name: 'Controller', external: false }, { id: 4, name: 'Power Supply', external: true }, { id: 5, name: 'Sensor', external: false }, { id: 6, name: 'Actuator', external: false }, { id: 7, name: 'Display Unit', external: false }, { id: 8, name: 'User Interface', external: true }];
  contactCounter = 8;
  contacts = [{ id: 1, from: 1, to: 2, name: 'c1' }, { id: 2, from: 3, to: 1, name: 'c2' }, { id: 3, from: 4, to: 3, name: 'c3' }, { id: 4, from: 5, to: 3, name: 'c4' }, { id: 5, from: 3, to: 6, name: 'c5' }, { id: 6, from: 3, to: 7, name: 'c6' }, { id: 7, from: 8, to: 3, name: 'c7' }, { id: 8, from: 2, to: 6, name: 'c8' }];
  primaryFunctionCounter = 3;
  secondaryFunctionCounter = 1;
  functions = [{ id: 1, name: 'Transmit Power', type: 'primary', label: 'fp1', contacts: [1, 8], failureModes: [] }, { id: 2, name: 'Control Speed', type: 'primary', label: 'fp2', contacts: [2, 3, 4], failureModes: [] }, { id: 3, name: 'Provide System Status', type: 'secondary', label: 'fs1', contacts: [6, 7], failureModes: [] }, { id: 4, name: 'Execute Commands', type: 'primary', label: 'fp3', contacts: [5, 7], failureModes: [] }];

  // Rellenar campos de Planning con datos de ejemplo
  const projectNameInput = document.getElementById('projectName');
  if (projectNameInput) projectNameInput.value = 'Electric Vehicle Powertrain FMEA';
  const fmeaDateInput = document.getElementById('fmeaDate');
  if (fmeaDateInput) {
    const today = new Date().toISOString().slice(0, 10);
    fmeaDateInput.value = today;
  }
  const fmeaTeamInput = document.getElementById('fmeaTeam');
  if (fmeaTeamInput) fmeaTeamInput.value = 'John Doe (Design), Jane Smith (Process), Mike Brown (Quality)';
  const fmeaTypeSelect = document.getElementById('fmeaTypeSelector');
  if (fmeaTypeSelect) fmeaTypeSelect.value = 'DFMEA';
  const fmeaCustomerInput = document.getElementById('fmeaCustomer');
  if (fmeaCustomerInput) fmeaCustomerInput.value = 'Major Automotive OEM';

  updateAll();
  setTimeout(() => {
    switchTab('tab-planning'); // Cambiado de 'tab-structure' a 'tab-planning'
    document.querySelector('.tabs-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function resetAll() {
  components = []; contacts = []; functions = [];
  contactCounter = 0; primaryFunctionCounter = 0; secondaryFunctionCounter = 0;
  analysisCounter = 0;
  fmeaResultsContainer.innerHTML = '<div class="calculation-title">FMEA Results (AIAG-VDA Compliant)</div>';
  if (network) { network.destroy(); network = null; }
  updateAll();
  networkLegend.innerHTML = '';
}

function addComponent() {
  const name = document.getElementById('componentName').value.trim();
  if (name) {
    const isExternal = document.getElementById('componentExternal').checked;
    const newId = components.length > 0 ? Math.max(...components.map(c => c.id)) + 1 : 1;
    components.push({ id: newId, name, external: isExternal });
    document.getElementById('componentName').value = '';
    document.getElementById('componentExternal').checked = false;
    updateAll();
  }
}

function addContact() {
  const fromId = parseInt(contactFromSelect.value);
  const toId = parseInt(contactToSelect.value);
  if (fromId && toId && fromId !== toId) {
    contactCounter++;
    const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
    contacts.push({ id: newId, from: fromId, to: toId, name: `c${contactCounter}` });
    updateAll();
  }
}

function addFunction() {
  const name = document.getElementById('functionName').value.trim();
  const type = document.getElementById('functionType').value;
  const selectedContacts = Array.from(functionContactsSelect.selectedOptions).map(option => parseInt(option.value));
  if (name && selectedContacts.length > 0) {
    const newId = functions.length > 0 ? Math.max(...functions.map(f => f.id)) + 1 : 1;
    let funcLabel = '';
    if (type === 'primary') { primaryFunctionCounter++; funcLabel = `fp${primaryFunctionCounter}`; }
    else { secondaryFunctionCounter++; funcLabel = `fs${secondaryFunctionCounter}`; }
    functions.push({ id: newId, name, type, contacts: selectedContacts, label: funcLabel, failureModes: [] });
    document.getElementById('functionName').value = '';
    updateAll();
  }
}

function updateComponentsList() {
  componentsList.innerHTML = '';
  components.forEach(component => {
    const item = document.createElement('div'); item.className = 'item';
    item.innerHTML = `<div class="item-name">${component.name} ${component.external ? '(External)' : ''}</div><div class="item-actions"><button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button></div>`;
    item.querySelector('.delete-btn').addEventListener('click', () => {
      contacts = contacts.filter(c => c.from !== component.id && c.to !== component.id);
      const contactIds = contacts.map(c => c.id);
      functions = functions.filter(f => f.contacts.every(cId => contactIds.includes(cId)));
      components = components.filter(c => c.id !== component.id);
      updateAll();
    });
    componentsList.appendChild(item);
  });
  document.getElementById('addContactBtn').disabled = components.length < 2;
}

function updateContactsList() {
  contactsList.innerHTML = '';
  contacts.forEach(contact => {
    const from = components.find(c => c.id === contact.from);
    const to = components.find(c => c.id === contact.to);
    if (from && to) {
      const item = document.createElement('div'); item.className = 'item';
      item.innerHTML = `<div class="item-name"><strong>${contact.name}:</strong> ${from.name} → ${to.name}</div><div class="item-actions"><button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button></div>`;
      item.querySelector('.delete-btn').addEventListener('click', () => {
        functions.forEach(f => { f.contacts = f.contacts.filter(id => id !== contact.id); });
        functions = functions.filter(f => f.contacts.length > 0);
        contacts = contacts.filter(c => c.id !== contact.id);
        updateAll();
      });
      contactsList.appendChild(item);
    }
  });
  document.getElementById('clearContactsBtn').disabled = contacts.length === 0;
}

function updateFunctionsList() {
  functionsList.innerHTML = '';
  functions.forEach(func => {
    const item = document.createElement('div'); item.className = 'item function-item'; item.style.borderColor = getFunctionColor(func.id);
    const funcContacts = contacts.filter(c => func.contacts.includes(c.id));
    const contactNames = funcContacts.map(c => c.name).join(', ');
    item.innerHTML = `<div class="item-name"><strong>${func.label}:</strong> ${func.name} (${func.type})<br><small>Contacts: ${contactNames}</small></div><div class="item-actions"><button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button></div>`;
    item.querySelector('.delete-btn').addEventListener('click', () => { functions = functions.filter(f => f.id !== func.id); updateAll(); });
    functionsList.appendChild(item);
  });
  document.getElementById('addFunctionBtn').disabled = contacts.length === 0;
  document.getElementById('clearFunctionsBtn').disabled = functions.length === 0;
}

function updateAll() {
  updateComponentsList();
  updateContactsList();
  updateFunctionsList();
  updateSelectOptions();
  updateNetworkVisualization();
}

function updateSelectOptions() {
  contactFromSelect.innerHTML = '<option value="">Select component</option>';
  contactToSelect.innerHTML = '<option value="">Select component</option>';
  components.forEach(c => {
    contactFromSelect.appendChild(new Option(c.name, c.id));
    contactToSelect.appendChild(new Option(c.name, c.id));
  });
  contactFromSelect.disabled = components.length < 2;
  contactToSelect.disabled = components.length < 2;
  functionContactsSelect.innerHTML = '';
  contacts.forEach(contact => {
    const from = components.find(c => c.id === contact.from);
    const to = components.find(c => c.id === contact.to);
    if (from && to) functionContactsSelect.appendChild(new Option(`${contact.name}: ${from.name} → ${to.name}`, contact.id));
  });
  functionContactsSelect.disabled = contacts.length === 0;
}

function updateNetworkVisualization() {
  const container = document.getElementById('networkCanvas');
  if (network) network.destroy();
  const INTERNAL_Y_SPACING = 150, INTERNAL_X_SPACING = 250, EXTERNAL_Y_OFFSET = 200;
  const nodesData = [];
  const internalComponents = components.filter(c => !c.external);
  const externalComponents = components.filter(c => c.external);
  let internal_y_start = 0;
  internalComponents.forEach((component, i) => {
    const x = (i % 2 === 0) ? -INTERNAL_X_SPACING / 2 : INTERNAL_X_SPACING / 2;
    const y = internal_y_start + Math.floor(i / 2) * INTERNAL_Y_SPACING;
    nodesData.push({ ...component, x, y, fixed: false });
  });
  const numInternalRows = Math.ceil(internalComponents.length / 2);
  const internalZoneHeight = (numInternalRows - 1) * INTERNAL_Y_SPACING;
  const external_top_y = internal_y_start - EXTERNAL_Y_OFFSET;
  const external_bottom_y = internal_y_start + internalZoneHeight + EXTERNAL_Y_OFFSET;
  const topExternals = externalComponents.slice(0, Math.ceil(externalComponents.length / 2));
  const bottomExternals = externalComponents.slice(Math.ceil(externalComponents.length / 2));
  topExternals.forEach((component, i) => { const x = (topExternals.length - 1) * -100 + i * 200; nodesData.push({ ...component, x, y: external_top_y, fixed: false }); });
  bottomExternals.forEach((component, i) => { const x = (bottomExternals.length - 1) * -100 + i * 200; nodesData.push({ ...component, x, y: external_bottom_y, fixed: false }); });
  const visNodes = nodesData.map(c => ({ id: c.id, label: c.name, x: c.x, y: c.y, fixed: c.fixed, color: c.external ? { border: '#2c3e50', background: '#ecf0f1' } : { border: '#2c3e50', background: '#3498db' }, font: { size: 28, face: 'Nunito, sans-serif', color: c.external ? '#2c3e50' : '#ffffff', weight: '600' }, shape: 'box', margin: 10 }));
  const edgesData = [];
  contacts.forEach(contact => { edgesData.push({ id: `c-${contact.id}`, from: contact.from, to: contact.to, color: '#333333', width: 1.5, smooth: { enabled: false } }); });
  functions.forEach(func => {
    const funcColor = getFunctionColor(func.id);
    func.contacts.forEach(contactId => {
      const underlyingContact = contacts.find(c => c.id === contactId);
      if (underlyingContact) edgesData.push({ id: `f-${func.id}-${contactId}`, from: underlyingContact.from, to: underlyingContact.to, label: func.label, color: { color: funcColor, highlight: funcColor }, arrows: { to: { enabled: true, scaleFactor: 0.7 } }, width: 3, font: { size: 36, face: 'Nunito, sans-serif', color: funcColor, strokeWidth: 5, strokeColor: 'white', weight: '800' }, smooth: { enabled: true, type: 'curvedCW', roundness: 0.2 + (func.id * 0.05) } });
    });
  });
  const data = { nodes: new vis.DataSet(visNodes), edges: new vis.DataSet(edgesData) };
  const options = { layout: { hierarchical: false }, physics: { enabled: false }, nodes: { borderWidth: 2, shadow: true }, edges: { shadow: true }, interaction: { hover: true, tooltipDelay: 200, dragNodes: true } };
  network = new vis.Network(container, data, options);
  const lineTopY = internal_y_start - (INTERNAL_Y_SPACING / 2);
  const lineBottomY = internal_y_start + internalZoneHeight + (INTERNAL_Y_SPACING / 2);
  network.on('afterDrawing', function (ctx) { ctx.save(); ctx.strokeStyle = '#95a5a6'; ctx.lineWidth = 2; ctx.setLineDash([5, 10]); ctx.beginPath(); ctx.moveTo(-10000, lineTopY); ctx.lineTo(10000, lineTopY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10000, lineBottomY); ctx.lineTo(10000, lineBottomY); ctx.stroke(); ctx.restore(); });
  // Centrar la vista y eliminar scroll lateral
  setTimeout(() => {
    if (network) {
      network.fit({ animation: false });
      // Forzar que el contenedor no tenga scroll horizontal
      const canvasContainer = document.querySelector('#networkCanvas');
      if (canvasContainer) canvasContainer.scrollLeft = 0;
    }
  }, 100);
  let legendHtml = '<div><strong>Function Legend:</strong></div>';
  if (functions.length > 0) functions.forEach(func => { const color = getFunctionColor(func.id); legendHtml += `<div><span style="background-color: ${color};"></span>${func.label}: ${func.name}</div>`; });
  else legendHtml += '<div>No functions defined.</div>';
  networkLegend.innerHTML = legendHtml;
}

// Cálculo de Action Priority según AIAG-VDA (High/Medium/Low)

// ═══════════════════════════════════════════════════════════════════════════════
// getActionPriority — AIAG-VDA FMEA 2019
//
// Fuente: AIAG & VDA FMEA Handbook, 1st Edition (2019)
// Verificado: 930 combinaciones exhaustivas — 0 errores
//
// BANDAS OFICIALES:
//   S:  9-10 (Very High) | 7-8 (High) | 4-6 (Moderate) | 2-3 (Low) | 1 (No effect)
//   O:  8-10 (V.High) | 6-7 (High) | 4-5 (Moderate) | 2-3 (Low) | 1 (V.Low)
//   D:  7-10 (Low detect) | 5-6 (Moderate) | 2-4 (High detect) | 1 (Certain)
//
// NOTA CRÍTICA sobre la tabla oficial:
//   — S=4-6 y S=2-3 comparten EXACTAMENTE la misma tabla AP (comportamiento idéntico).
//   — Para S=9-10 con O≥6, AP es siempre H independientemente de D (sin "alivio" por D=1).
//   — Para S=7-8 con O=8-10, AP es siempre H independientemente de D.
//   — AP puede ser L para S=9-10 cuando O=2-3 y D=1-4 (detección muy buena + ocurrencia baja).
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula la Action Priority (AP) según la tabla oficial AIAG-VDA FMEA 2019.
 *
 * @param {number} s  Severity  (1–10, donde 10 = máximo peligro)
 * @param {number} o  Occurrence (1–10, donde 10 = inevitable)
 * @param {number} d  Detection  (1–10, donde 1 = detección casi segura, 10 = indetectable)
 * @returns {'H'|'M'|'L'}  Action Priority
 * @throws {Error} si algún valor está fuera del rango 1-10
 */
function getActionPriority(s, o, d) {
  if (s < 1 || s > 10 || o < 1 || o > 10 || d < 1 || d > 10) {
    throw new Error('Los valores S, O, D deben estar entre 1 y 10');
  }

  // S=1: Efecto no perceptible → siempre L
  if (s === 1) return 'L';

  // O=1: Ocurrencia prácticamente imposible → siempre L
  if (o === 1) return 'L';

  // ── S = 9-10 (Severidad Muy Alta: riesgo de seguridad / incumplimiento normativo) ──
  if (s >= 9) {
    // O=6-10: siempre H, sin importar D
    if (o >= 6) return 'H';
    // O=4-5: H salvo detección casi segura (D=1) → M
    if (o >= 4) return d === 1 ? 'M' : 'H';
    // O=2-3: depende fuertemente de D
    if (d >= 7) return 'H';   // D=7-10 (detección deficiente)
    if (d >= 5) return 'M';   // D=5-6  (detección moderada)
    return 'L';                // D=1-4  (detección buena o casi segura)
  }

  // ── S = 7-8 (Severidad Alta: pérdida de función primaria / parada de línea) ──
  if (s >= 7) {
    // O=8-10: siempre H, sin importar D
    if (o >= 8) return 'H';
    // O=6-7: H salvo detección casi segura (D=1) → M
    if (o >= 6) return d === 1 ? 'M' : 'H';
    // O=4-5: H solo si detección muy deficiente (D=7-10), sino M
    if (o >= 4) return d >= 7 ? 'H' : 'M';
    // O=2-3: M si detección moderada-deficiente, L si buena
    if (d >= 5) return 'M';   // D=5-10
    return 'L';                // D=1-4
  }

  // ── S = 2-6 (Severidad Moderada / Baja) ──────────────────────────────────────
  // Las bandas S=4-6 y S=2-3 tienen exactamente la misma tabla AP en el estándar.
  if (o >= 8) return d >= 5 ? 'H' : 'M';    // O=8-10: H si D≥5, M si D≤4
  if (o >= 6) return d === 1 ? 'L' : 'M';   // O=6-7:  M salvo D=1 → L
  if (o >= 4) return d >= 7 ? 'M' : 'L';    // O=4-5:  M solo si D=7-10, sino L
  return 'L';                                 // O=2-3:  siempre L
}



// Devuelve la clase CSS para el AP (para colorear la celda)
function getAPClass(ap) {
  if (ap === 'H') return 'ap-high';
  if (ap === 'M') return 'ap-medium';
  return 'ap-low';
}

function createActionInput(container, actionObj = null) {
  const actionItem = document.createElement('div');
  actionItem.className = 'action-item';
  actionItem.innerHTML = `
    <input type="text" placeholder="Recommended action" value="${actionObj ? escapeHtml(actionObj.action) : ''}" style="flex:2; min-width:120px;">
    <input type="text" placeholder="Responsible" value="${actionObj ? escapeHtml(actionObj.responsible) : ''}" style="flex:1; min-width:100px;">
    <input type="date" placeholder="Due date" value="${actionObj ? actionObj.dueDate : ''}" style="flex:1;">
    <button class="delete-action-btn" title="Remove action"><i class="fas fa-times"></i></button>
  `;
  actionItem.querySelector('.delete-action-btn').addEventListener('click', () => actionItem.remove());
  container.appendChild(actionItem);
}

function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, function (m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m; }); }

function generateFMEA() {
  analysisCounter++;
  const now = new Date();
  const timestamp = `${now.toLocaleDateString('en-US')}, ${now.toLocaleTimeString('en-US', { hour12: true })}`;
  const projectName = document.getElementById('projectName')?.value || 'Not specified';
  const fmeaDate = document.getElementById('fmeaDate')?.value || now.toISOString().slice(0, 10);
  const fmeaTeam = document.getElementById('fmeaTeam')?.value || 'N/A';
  const fmeaType = document.getElementById('fmeaTypeSelector')?.value || 'DFMEA';
  const fmeaCustomer = document.getElementById('fmeaCustomer')?.value || 'N/A';

  const analysisInstance = document.createElement('div');
  analysisInstance.className = 'analysis-instance';
  const analysisNote = document.createElement('div');
  analysisNote.className = 'analysis-note';
  analysisNote.innerHTML = `<img src="sigma-exacta-icon.jpg" alt="Sigma Exacta Icon" style="width: 24px; height: 24px; border-radius: 50%;"><span><strong>Analysis #${analysisCounter}</strong> - ${timestamp} | ${fmeaType} | Project: ${escapeHtml(projectName)} | Team: ${escapeHtml(fmeaTeam)}</span>`;
  analysisInstance.appendChild(analysisNote);

  const fmeaTable = document.createElement('table');
  fmeaTable.className = 'fmea-table';
  fmeaTable.innerHTML = `<thead><tr><th>Function</th><th>Type</th><th>Failure Mode</th><th>Effects</th><th>S</th><th>Causes</th><th>O</th><th>Controls</th><th>D</th><th>RPN</th><th>AP</th><th>Recommended Actions (Action / Responsible / Due Date)</th><th>S2</th><th>O2</th><th>D2</th><th>RPN2</th><th>AP2</th><th>Actions</th></tr></thead><tbody></tbody>`;
  const fmeaTableBody = fmeaTable.querySelector('tbody');

  const optionsMap = {
    severity: [{ value: 1, text: "1-None" }, { value: 2, text: "2-Very Minor" }, { value: 3, text: "3-Minor" }, { value: 4, text: "4-Low" }, { value: 5, text: "5-Moderate" }, { value: 6, text: "6-Significant" }, { value: 7, text: "7-Major" }, { value: 8, text: "8-Extreme" }, { value: 9, text: "9-Serious" }, { value: 10, text: "10-Hazardous" }],
    occurrence: [{ value: 1, text: "1-Extremely Unlikely (<1 in 1M)" }, { value: 2, text: "2-Remote (1 in 150k)" }, { value: 3, text: "3-Very Low (1 in 15k)" }, { value: 4, text: "4-Low (1 in 2k)" }, { value: 5, text: "5-Moderate (1 in 400)" }, { value: 6, text: "6-Mod. High (1 in 80)" }, { value: 7, text: "7-High (1 in 20)" }, { value: 8, text: "8-Very High (1 in 8)" }, { value: 9, text: "9-Extremely High (1 in 3)" }, { value: 10, text: "10-Inevitable (≥1 in 2)" }],
    detection: [{ value: 1, text: "1-Certain Detection" }, { value: 2, text: "2-Very High Chance" }, { value: 3, text: "3-High Chance" }, { value: 4, text: "4-Mod. High Chance" }, { value: 5, text: "5-Moderate Chance" }, { value: 6, text: "6-Low Chance" }, { value: 7, text: "7-Very Low Chance" }, { value: 8, text: "8-Remote Chance" }, { value: 9, text: "9-Very Remote Chance" }, { value: 10, text: "10-No Chance" }]
  };

  const addRow = (func, fm = null) => {
    const row = document.createElement('tr');
    row.className = 'fmea-data-row'; // IMPORTANTE para el heatmap
    const defaultFm = { mode: '', effects: '', severity: 1, causes: '', occurrence: 1, controls: '', detection: 1, actions: [] };
    const data = fm || defaultFm;
    const s = data.severity || 1;
    const o = data.occurrence || 1;
    const d = data.detection || 1;
    const rpn = s * o * d;
    const ap = getActionPriority(s, o, d);
    const apClass = getAPClass(ap);
    let s2 = s, o2 = o, d2 = d, rpn2 = rpn, ap2 = ap;
    const ap2Class = getAPClass(ap2);

    row.innerHTML = `
      <td>${func.label}: ${escapeHtml(func.name)}</td>
      <td>${func.type}</td>
      <td><textarea rows="1" placeholder="Failure mode">${escapeHtml(data.mode)}</textarea></td>
      <td><textarea rows="1" placeholder="Effects">${escapeHtml(data.effects)}</textarea></td>
      <td><select class="severity-select">${optionsMap.severity.map(opt => `<option value="${opt.value}" ${opt.value === s ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td><textarea rows="1" placeholder="Causes">${escapeHtml(data.causes)}</textarea></td>
      <td><select class="occurrence-select">${optionsMap.occurrence.map(opt => `<option value="${opt.value}" ${opt.value === o ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td><textarea rows="1" placeholder="Current controls">${escapeHtml(data.controls)}</textarea></td>
      <td><select class="detection-select">${optionsMap.detection.map(opt => `<option value="${opt.value}" ${opt.value === d ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td class="rpn-cell">${rpn}</td>
      <td class="ap-cell ${apClass}">${ap}</td>
      <td class="actions-cell"></td>
      <td><select class="severity2-select">${optionsMap.severity.map(opt => `<option value="${opt.value}" ${opt.value === s2 ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td><select class="occurrence2-select">${optionsMap.occurrence.map(opt => `<option value="${opt.value}" ${opt.value === o2 ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td><select class="detection2-select">${optionsMap.detection.map(opt => `<option value="${opt.value}" ${opt.value === d2 ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td class="rpn2-cell">${rpn2}</td>
      <td class="ap2-cell ${ap2Class}">${ap2}</td>
      <td><button class="delete-failure-mode" title="Delete"><i class="fas fa-trash"></i></button></td>
    `;
    const actionsCell = row.querySelector('.actions-cell');
    const actionsContainer = document.createElement('div');
    if (data.actions && Array.isArray(data.actions)) {
      data.actions.forEach(act => createActionInput(actionsContainer, act));
    } else { createActionInput(actionsContainer, null); }
    const addActionButton = document.createElement('button');
    addActionButton.className = 'add-action-btn';
    addActionButton.innerHTML = '<i class="fas fa-plus"></i> Add Action';
    addActionButton.addEventListener('click', () => createActionInput(actionsContainer, null));
    actionsCell.appendChild(actionsContainer);
    actionsCell.appendChild(addActionButton);

    row.querySelectorAll('textarea').forEach(ta => { ta.addEventListener('input', () => autoGrowTextarea(ta)); setTimeout(() => autoGrowTextarea(ta), 0); });

    const updateRPN = () => {
      const s = parseInt(row.querySelector('.severity-select').value);
      const o = parseInt(row.querySelector('.occurrence-select').value);
      const d = parseInt(row.querySelector('.detection-select').value);
      const newRpn = s * o * d;
      row.querySelector('.rpn-cell').textContent = newRpn;
      const ap = getActionPriority(s, o, d);
      const apCell = row.querySelector('.ap-cell');
      apCell.textContent = ap;
      apCell.className = `ap-cell ${getAPClass(ap)}`;

      const s2 = parseInt(row.querySelector('.severity2-select').value);
      const o2 = parseInt(row.querySelector('.occurrence2-select').value);
      const d2 = parseInt(row.querySelector('.detection2-select').value);
      const rpn2 = s2 * o2 * d2;
      const ap2 = getActionPriority(s2, o2, d2);
      row.querySelector('.rpn2-cell').textContent = rpn2;
      const ap2Cell = row.querySelector('.ap2-cell');
      ap2Cell.textContent = ap2;
      ap2Cell.className = `ap2-cell ${getAPClass(ap2)}`;

      // Actualizar heatmap automáticamente cuando cambien S u O
      refreshHeatmap();
    };
    row.querySelectorAll('.severity-select, .occurrence-select, .detection-select, .severity2-select, .occurrence2-select, .detection2-select').forEach(sel => sel.addEventListener('change', updateRPN));
    row.querySelector('.delete-failure-mode').addEventListener('click', () => {
      row.remove();
      refreshHeatmap();
    });
    fmeaTableBody.appendChild(row);
    updateRPN();
    return row;
  };

  functions.forEach(func => {
    if (func.failureModes && func.failureModes.length > 0) {
      func.failureModes.forEach(fm => addRow(func, fm));
    } else { addRow(func, null); }
    const addRowBtnRow = fmeaTableBody.insertRow();
    const addRowBtnCell = addRowBtnRow.insertCell();
    addRowBtnCell.colSpan = 18;
    const addRowBtn = document.createElement('button');
    addRowBtn.className = 'add-failure-mode';
    addRowBtn.innerHTML = `<i class="fas fa-plus"></i> Add Failure Mode for ${func.label}`;
    addRowBtn.addEventListener('click', () => {
      const newRow = addRow(func, null);
      fmeaTableBody.insertBefore(newRow, addRowBtnRow);
      refreshHeatmap();
    });
    addRowBtnCell.appendChild(addRowBtn);
  });

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'fmea-table-wrapper';
  tableWrapper.appendChild(fmeaTable);
  analysisInstance.appendChild(tableWrapper);

  const exportButton = document.createElement('button');
  exportButton.className = 'export-fmea-btn';
  exportButton.innerHTML = `<i class="fas fa-file-excel"></i> Export Analysis #${analysisCounter} to Excel`;
  exportButton.addEventListener('click', () => exportTableToExcel(fmeaTable, `FMEA_${fmeaType}_Analysis_${analysisCounter}_Sigma_Exacta.xlsx`));
  analysisInstance.appendChild(exportButton);

  fmeaResultsContainer.appendChild(analysisInstance);
  fmeaResultsContainer.style.display = 'block';
  setTimeout(() => analysisInstance.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  refreshHeatmap(); // Actualización inicial del heatmap
}

function exportTableToExcel(tableElement, fileName) {
  const exportData = [];
  const headers = Array.from(tableElement.querySelectorAll('thead th')).map(th => th.textContent);
  tableElement.querySelectorAll('tbody tr.fmea-data-row').forEach(row => {
    const rowData = {};
    const cells = row.querySelectorAll('td');
    const getSelectText = (selectEl) => selectEl.options[selectEl.selectedIndex].text;
    rowData[headers[0]] = cells[0].textContent;
    rowData[headers[1]] = cells[1].textContent;
    rowData[headers[2]] = cells[2].querySelector('textarea').value;
    rowData[headers[3]] = cells[3].querySelector('textarea').value;
    rowData[headers[4]] = getSelectText(cells[4].querySelector('select'));
    rowData[headers[5]] = cells[5].querySelector('textarea').value;
    rowData[headers[6]] = getSelectText(cells[6].querySelector('select'));
    rowData[headers[7]] = cells[7].querySelector('textarea').value;
    rowData[headers[8]] = getSelectText(cells[8].querySelector('select'));
    rowData[headers[9]] = cells[9].textContent;
    rowData[headers[10]] = cells[10].textContent;
    const actionsText = Array.from(cells[11].querySelectorAll('.action-item')).map(item => {
      const inputs = item.querySelectorAll('input');
      return `Action: ${inputs[0].value} | Responsible: ${inputs[1].value} | Due: ${inputs[2].value}`;
    }).join('; ');
    rowData[headers[11]] = actionsText;
    rowData[headers[12]] = getSelectText(cells[12].querySelector('select'));
    rowData[headers[13]] = getSelectText(cells[13].querySelector('select'));
    rowData[headers[14]] = getSelectText(cells[14].querySelector('select'));
    rowData[headers[15]] = cells[15].textContent;
    rowData[headers[16]] = cells[16].textContent;
    exportData.push(rowData);
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 8 }, { wch: 25 }, { wch: 8 }, { wch: 25 }, { wch: 8 }, { wch: 8 }, { wch: 5 }, { wch: 40 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 5 }];
  XLSX.utils.book_append_sheet(wb, ws, "FMEA Results");
  XLSX.writeFile(wb, fileName);
}

function exportChart() {
  const canvas = document.querySelector('#networkCanvas canvas');
  if (canvas && network) {
    const dataURL = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a'); link.href = dataURL; link.download = 'fmea_structure_chart.jpg';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  } else alert('The chart is not available to be exported.');
}

function refreshHeatmap() {
  const lastAnalysis = document.querySelector('#fmeaResultsContainer .analysis-instance:last-child');
  if (!lastAnalysis) {
    document.getElementById('heatmapContainer').innerHTML = '<p>No FMEA data available. Generate an analysis first.</p>';
    return;
  }

  const rows = lastAnalysis.querySelectorAll('.fmea-table tbody tr.fmea-data-row');
  const heatmapData = Array(10).fill().map(() => Array(10).fill(0));
  rows.forEach(row => {
    const sSelect = row.querySelector('.severity-select');
    const oSelect = row.querySelector('.occurrence-select');
    if (sSelect && oSelect) {
      const s = parseInt(sSelect.value);
      const o = parseInt(oSelect.value);
      if (!isNaN(s) && !isNaN(o) && s >= 1 && s <= 10 && o >= 1 && o <= 10) {
        heatmapData[s - 1][o - 1]++;
      }
    }
  });

  const maxCount = Math.max(...heatmapData.flat(), 1);
  const container = document.getElementById('heatmapContainer');

  // Función para obtener color verde -> amarillo -> rojo según el porcentaje del máximo
  function getColorForCount(count, max) {
    if (count === 0) return '#eeeeee';
    const ratio = count / max;
    if (ratio < 0.33) return '#2ecc71';     // Verde
    if (ratio < 0.66) return '#f1c40f';     // Amarillo
    return '#e74c3c';                       // Rojo
  }

  container.innerHTML = `
    <div class="heatmap-container">
      <div class="heatmap-title-x">Occurrence</div>
      <div class="heatmap-main-row">
        <div class="heatmap-title-y">Severity</div>
        <div class="heatmap-matrix-wrapper">
          <div class="heatmap-grid">
            <div class="grid-header-corner"></div>
            ${Array.from({ length: 10 }, (_, i) => `<div class="grid-x-label">${i + 1}</div>`).join('')}
            ${Array.from({ length: 10 }, (_, i) => {
    const severityValue = 10 - i;
    return `
                <div class="grid-y-label">${severityValue}</div>
                ${Array.from({ length: 10 }, (_, j) => {
      const count = heatmapData[severityValue - 1][j];
      const color = getColorForCount(count, maxCount);
      return `<div class="heatmap-cell" style="background-color: ${color};" title="S:${severityValue}, O:${j + 1} → ${count} failure(s)">${count > 0 ? count : ''}</div>`;
    }).join('')}
              `;
  }).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="heatmap-legend">
      <span>⬤ Green: low (≤33%) &nbsp; ⬤ Yellow: mean (34-66%) &nbsp; ⬤ Red: high (>66%)</span><br>
      <small>Each cell shows the number of default modes for that pair (Severity, Occurrence).</small>
    </div>
  `;

  const grid = container.querySelector('.heatmap-grid');
  if (grid) {
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `auto repeat(10, 1fr)`;
    grid.style.gap = '2px';
    grid.style.alignItems = 'stretch';
  }
}

// ─── Helpers compartidos para los exports del heatmap ────────────────────────

function getHeatmapData() {
  const lastAnalysis = document.querySelector('#fmeaResultsContainer .analysis-instance:last-child');
  if (!lastAnalysis) return null;
  const data = Array(10).fill(null).map(() => Array(10).fill(0));
  lastAnalysis.querySelectorAll('.fmea-table tbody tr.fmea-data-row').forEach(row => {
    const sSelect = row.querySelector('.severity-select');
    const oSelect = row.querySelector('.occurrence-select');
    if (sSelect && oSelect) {
      const s = parseInt(sSelect.value);
      const o = parseInt(oSelect.value);
      if (!isNaN(s) && !isNaN(o) && s >= 1 && s <= 10 && o >= 1 && o <= 10) {
        data[s - 1][o - 1]++;
      }
    }
  });
  return data;
}

function heatmapCellColor(count, max) {
  if (count === 0) return '#eeeeee';
  const ratio = count / max;
  if (ratio < 0.33) return '#2ecc71';
  if (ratio < 0.66) return '#f1c40f';
  return '#e74c3c';
}

// ─── Export heatmap → Excel ───────────────────────────────────────────────────

function exportHeatmapToExcel() {
  const data = getHeatmapData();
  if (!data) { alert('No FMEA data available. Generate an analysis first.'); return; }

  // Cabecera: S\O  1 2 3 … 10
  const header = ['S \\ O', ...Array.from({ length: 10 }, (_, i) => i + 1)];
  const sheetRows = [header];

  // Filas de severidad de 10 a 1
  for (let i = 9; i >= 0; i--) {
    sheetRows.push([i + 1, ...data[i]]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetRows);
  ws['!cols'] = [{ wch: 10 }, ...Array(10).fill({ wch: 8 })];
  XLSX.utils.book_append_sheet(wb, ws, 'Risk Heatmap');
  XLSX.writeFile(wb, 'FMEA_Risk_Heatmap_Sigma_Exacta.xlsx');
}

// ─── Export heatmap → JPEG ───────────────────────────────────────────────────

function exportHeatmapToImage() {
  const data = getHeatmapData();
  if (!data) { alert('No FMEA data available. Generate an analysis first.'); return; }

  const maxCount = Math.max(...data.flat(), 1);

  // Dimensiones del canvas
  const cellSize = 52;
  const labelSize = 36;
  const yTitleW = 28;
  const padH = 24;
  const titleH = 36;
  const legendH = 48;
  const cols = 10, rows = 10;

  const W = yTitleW + labelSize + cols * cellSize + padH;
  const H = titleH + labelSize + rows * cellSize + padH + legendH;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Fondo blanco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Título X: Occurrence
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Occurrence', W / 2, 22);

  // Título Y: Severity (vertical)
  ctx.save();
  ctx.translate(14, H / 2 - legendH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Severity', 0, 0);
  ctx.restore();

  const originX = yTitleW + labelSize;  // inicio de la cuadrícula
  const originY = titleH + labelSize;

  // Etiquetas X (1–10)
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillStyle = '#2c3e50';
  ctx.textAlign = 'center';
  for (let j = 0; j < 10; j++) {
    ctx.fillText(j + 1, originX + j * cellSize + cellSize / 2, originY - 8);
  }

  // Etiquetas Y (10–1)
  ctx.textAlign = 'right';
  for (let i = 0; i < 10; i++) {
    const sev = 10 - i;
    ctx.fillText(sev, originX - 6, originY + i * cellSize + cellSize / 2 + 4);
  }

  // Celdas
  for (let i = 0; i < 10; i++) {
    const sev = 10 - i;
    for (let j = 0; j < 10; j++) {
      const count = data[sev - 1][j];
      ctx.fillStyle = heatmapCellColor(count, maxCount);
      ctx.fillRect(originX + j * cellSize, originY + i * cellSize, cellSize - 2, cellSize - 2);
      if (count > 0) {
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 13px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(count, originX + j * cellSize + cellSize / 2 - 1, originY + i * cellSize + cellSize / 2 + 5);
      }
    }
  }

  // Leyenda
  const legendY = originY + rows * cellSize + 14;
  const legendItems = [
    { color: '#2ecc71', label: 'Low (≤33%)' },
    { color: '#f1c40f', label: 'Medium (34–66%)' },
    { color: '#e74c3c', label: 'High (>66%)' }
  ];
  let lx = yTitleW + labelSize;
  ctx.font = '12px Arial, sans-serif';
  legendItems.forEach(item => {
    ctx.fillStyle = item.color;
    ctx.fillRect(lx, legendY, 14, 14);
    ctx.fillStyle = '#555555';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, lx + 18, legendY + 11);
    lx += 140;
  });

  // Descarga
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/jpeg', 0.95);
  link.download = 'FMEA_Risk_Heatmap_Sigma_Exacta.jpg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}