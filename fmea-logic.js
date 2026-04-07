// fmea-logic.js - AIAG-VDA 2019 Compliant

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
  document.getElementById('exportHeatmapExcelBtn')?.addEventListener('click', exportHeatmapToExcel);
  document.getElementById('exportHeatmapImageBtn')?.addEventListener('click', exportHeatmapToImage);
  document.getElementById('showCriteriaBtn')?.addEventListener('click', showCriteriaModal);

  updateAll();
}

function showCriteriaModal() {
  const modal = document.getElementById('criteriaModal');
  if (modal) modal.style.display = 'block';
  const closeBtn = modal.querySelector('.close-modal');
  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };
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
  // Components with hierarchy
  components = [
    { id: 1, name: 'Electric Vehicle System', level: 'system', parentId: null, external: false },
    { id: 2, name: 'Powertrain', level: 'subsystem', parentId: 1, external: false },
    { id: 3, name: 'Motor', level: 'component', parentId: 2, external: false },
    { id: 4, name: 'Gearbox', level: 'component', parentId: 2, external: false },
    { id: 5, name: 'Controller', level: 'component', parentId: 2, external: false },
    { id: 6, name: 'Power Supply', level: 'component', parentId: 1, external: true },
    { id: 7, name: 'Sensor', level: 'component', parentId: 5, external: false },
    { id: 8, name: 'Actuator', level: 'component', parentId: 5, external: false },
    { id: 9, name: 'Display Unit', level: 'component', parentId: 1, external: false },
    { id: 10, name: 'User Interface', level: 'component', parentId: 1, external: true }
  ];
  contactCounter = 10;
  contacts = [
    { id: 1, from: 3, to: 4, name: 'c1', interactionType: 'Force' },
    { id: 2, from: 5, to: 3, name: 'c2', interactionType: 'Signal' },
    { id: 3, from: 6, to: 5, name: 'c3', interactionType: 'Energy' },
    { id: 4, from: 7, to: 5, name: 'c4', interactionType: 'Signal' },
    { id: 5, from: 5, to: 8, name: 'c5', interactionType: 'Signal' },
    { id: 6, from: 5, to: 9, name: 'c6', interactionType: 'Information' },
    { id: 7, from: 10, to: 5, name: 'c7', interactionType: 'Signal' },
    { id: 8, from: 4, to: 8, name: 'c8', interactionType: 'Force' }
  ];
  primaryFunctionCounter = 3;
  secondaryFunctionCounter = 1;
  functions = [
    { id: 1, name: 'Transmit Power', requirement: '≥5 kW at 95% efficiency', isUnwanted: false, type: 'primary', label: 'fp1', contacts: [1, 8], failureModes: [] },
    { id: 2, name: 'Control Speed', requirement: '±2% accuracy', isUnwanted: false, type: 'primary', label: 'fp2', contacts: [2, 3, 4], failureModes: [] },
    { id: 3, name: 'Provide System Status', requirement: 'Update every 100ms', isUnwanted: false, type: 'secondary', label: 'fs1', contacts: [6, 7], failureModes: [] },
    { id: 4, name: 'Execute Commands', requirement: '<50ms response', isUnwanted: false, type: 'primary', label: 'fp3', contacts: [5, 7], failureModes: [] }
  ];

  // Planning data
  document.getElementById('projectName').value = 'Electric Vehicle Powertrain FMEA';
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('fmeaDate').value = today;
  document.getElementById('fmeaTeam').value = 'John Doe (Design), Jane Smith (Process), Mike Brown (Quality)';
  document.getElementById('fmeaTypeSelector').value = 'DFMEA';
  document.getElementById('fmeaCustomer').value = 'Major Automotive OEM';
  document.getElementById('fmeaDocNumber').value = 'FMEA-EV-2025-001';
  document.getElementById('fmeaRevision').value = 'Rev. A';
  document.getElementById('fmeaEngResponsible').value = 'Alice Chen, Senior Design Engineer';
  document.getElementById('fmeaPlant').value = 'Shanghai Plant A';
  document.getElementById('fmeaScope').value = 'Intent: Analyze powertrain risks for high-volume production. Timing: Q3 2025. Tasks: DFMEA and PFMEA. Tools: Sigma Exacta. Assumptions: Ambient temp 0-40°C.';
  document.getElementById('fmeaPreviousRef').value = 'FMEA-PREV-2024-089';

  updateAll();
  setTimeout(() => {
    switchTab('tab-planning');
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
  const level = document.getElementById('componentLevel').value;
  const parentId = document.getElementById('componentParent').value;
  const isExternal = document.getElementById('componentExternal').checked;
  if (name) {
    const newId = components.length > 0 ? Math.max(...components.map(c => c.id)) + 1 : 1;
    components.push({ id: newId, name, level, parentId: parentId ? parseInt(parentId) : null, external: isExternal });
    document.getElementById('componentName').value = '';
    document.getElementById('componentExternal').checked = false;
    updateAll();
  }
}

function updateParentSelect() {
  const parentSelect = document.getElementById('componentParent');
  parentSelect.innerHTML = '<option value="">None (Top level)</option>';
  components.forEach(c => {
    parentSelect.appendChild(new Option(`${c.name} (${c.level})`, c.id));
  });
}

function addContact() {
  const fromId = parseInt(contactFromSelect.value);
  const toId = parseInt(contactToSelect.value);
  const interactionType = document.getElementById('contactType').value;
  if (fromId && toId && fromId !== toId) {
    contactCounter++;
    const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
    contacts.push({ id: newId, from: fromId, to: toId, name: `c${contactCounter}`, interactionType });
    updateAll();
  }
}

function addFunction() {
  const name = document.getElementById('functionName').value.trim();
  const requirement = document.getElementById('functionRequirement').value.trim();
  const isUnwanted = document.getElementById('functionUnwanted').checked;
  const type = document.getElementById('functionType').value;
  const selectedContacts = Array.from(functionContactsSelect.selectedOptions).map(option => parseInt(option.value));
  if (name && selectedContacts.length > 0) {
    const newId = functions.length > 0 ? Math.max(...functions.map(f => f.id)) + 1 : 1;
    let funcLabel = '';
    if (type === 'primary') { primaryFunctionCounter++; funcLabel = `fp${primaryFunctionCounter}`; }
    else { secondaryFunctionCounter++; funcLabel = `fs${secondaryFunctionCounter}`; }
    functions.push({ id: newId, name, requirement, isUnwanted, type, contacts: selectedContacts, label: funcLabel, failureModes: [] });
    document.getElementById('functionName').value = '';
    document.getElementById('functionRequirement').value = '';
    document.getElementById('functionUnwanted').checked = false;
    updateAll();
  }
}

function updateComponentsList() {
  componentsList.innerHTML = '';
  components.forEach(component => {
    const item = document.createElement('div'); item.className = 'item';
    item.innerHTML = `<div class="item-name">${component.name} (${component.level})${component.external ? ' [External]' : ''}${component.parentId ? ' → parent: ' + (components.find(c => c.id === component.parentId)?.name || '?') : ''}</div><div class="item-actions"><button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button></div>`;
    item.querySelector('.delete-btn').addEventListener('click', () => {
      contacts = contacts.filter(c => c.from !== component.id && c.to !== component.id);
      const contactIds = contacts.map(c => c.id);
      functions = functions.filter(f => f.contacts.every(cId => contactIds.includes(cId)));
      components = components.filter(c => c.id !== component.id);
      updateAll();
    });
    componentsList.appendChild(item);
  });
  updateParentSelect();
  document.getElementById('addContactBtn').disabled = components.length < 2;
}

function updateContactsList() {
  contactsList.innerHTML = '';
  contacts.forEach(contact => {
    const from = components.find(c => c.id === contact.from);
    const to = components.find(c => c.id === contact.to);
    if (from && to) {
      const item = document.createElement('div'); item.className = 'item';
      item.innerHTML = `<div class="item-name"><strong>${contact.name} (${contact.interactionType}):</strong> ${from.name} → ${to.name}</div><div class="item-actions"><button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button></div>`;
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
    item.innerHTML = `<div class="item-name"><strong>${func.label}:</strong> ${func.name} (${func.type})${func.requirement ? '<br><small>Req: ' + escapeHtml(func.requirement) + '</small>' : ''}${func.isUnwanted ? '<br><small>⚠️ Unwanted function</small>' : ''}<br><small>Contacts: ${contactNames}</small></div><div class="item-actions"><button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button></div>`;
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
    if (from && to) functionContactsSelect.appendChild(new Option(`${contact.name} (${contact.interactionType}): ${from.name} → ${to.name}`, contact.id));
  });
  functionContactsSelect.disabled = contacts.length === 0;
}

function updateNetworkVisualization() {
  const container = document.getElementById('networkCanvas');
  if (network) network.destroy();

  // Organize nodes by level for vertical layout
  const systems = components.filter(c => c.level === 'system' && !c.external);
  const subsystems = components.filter(c => c.level === 'subsystem' && !c.external);
  const componentsLevel = components.filter(c => c.level === 'component' && !c.external);
  const externals = components.filter(c => c.external);

  const nodesData = [];
  const levelY = { system: -250, subsystem: 0, component: 250 };
  const xSpacing = 200;

  systems.forEach((comp, i) => {
    nodesData.push({ ...comp, x: (i - (systems.length - 1) / 2) * xSpacing, y: levelY.system, fixed: false });
  });
  subsystems.forEach((comp, i) => {
    nodesData.push({ ...comp, x: (i - (subsystems.length - 1) / 2) * xSpacing, y: levelY.subsystem, fixed: false });
  });
  componentsLevel.forEach((comp, i) => {
    nodesData.push({ ...comp, x: (i - (componentsLevel.length - 1) / 2) * xSpacing, y: levelY.component, fixed: false });
  });
  // External components placed on sides
  externals.forEach((comp, i) => {
    nodesData.push({ ...comp, x: (i % 2 === 0 ? -300 : 300), y: -100 + i * 100, fixed: false });
  });

  const visNodes = nodesData.map(c => ({
    id: c.id, label: c.name, x: c.x, y: c.y, fixed: c.fixed,
    color: c.external ? { border: '#2c3e50', background: '#ecf0f1' } : { border: '#2c3e50', background: '#3498db' },
    font: { size: 28, face: 'Nunito, sans-serif', color: c.external ? '#2c3e50' : '#ffffff', weight: '600' },
    shape: 'box', margin: 10
  }));

  const edgesData = [];
  contacts.forEach(contact => {
    edgesData.push({ id: `c-${contact.id}`, from: contact.from, to: contact.to, color: '#333333', width: 1.5, smooth: { enabled: false }, label: contact.interactionType, font: { size: 18 } });
  });
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
  setTimeout(() => { if (network) network.fit({ animation: false }); }, 100);

  let legendHtml = '<div><strong>Function Legend:</strong></div>';
  if (functions.length > 0) functions.forEach(func => { const color = getFunctionColor(func.id); legendHtml += `<div><span style="background-color: ${color};"></span>${func.label}: ${func.name}</div>`; });
  else legendHtml += '<div>No functions defined.</div>';
  networkLegend.innerHTML = legendHtml;
}

// AIAG-VDA Action Priority (mantenemos la misma función correcta)
function getActionPriority(s, o, d) {
  if (s < 1 || s > 10 || o < 1 || o > 10 || d < 1 || d > 10) throw new Error('S,O,D must be 1-10');
  if (s === 1 || o === 1) return 'L';
  if (s >= 9) {
    if (o >= 6) return 'H';
    if (o >= 4) return d === 1 ? 'M' : 'H';
    if (d >= 7) return 'H';
    if (d >= 5) return 'M';
    return 'L';
  }
  if (s >= 7) {
    if (o >= 8) return 'H';
    if (o >= 6) return d === 1 ? 'M' : 'H';
    if (o >= 4) return d >= 7 ? 'H' : 'M';
    if (d >= 5) return 'M';
    return 'L';
  }
  if (o >= 8) return d >= 5 ? 'H' : 'M';
  if (o >= 6) return d === 1 ? 'L' : 'M';
  if (o >= 4) return d >= 7 ? 'M' : 'L';
  return 'L';
}

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
    <select class="action-status" style="flex:1;">
      <option value="Open" ${actionObj?.status === 'Open' ? 'selected' : ''}>Open</option>
      <option value="In Progress" ${actionObj?.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
      <option value="Completed" ${actionObj?.status === 'Completed' ? 'selected' : ''}>Completed</option>
      <option value="Cancelled" ${actionObj?.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
    </select>
    <input type="text" placeholder="Evidence/Reference" value="${actionObj ? escapeHtml(actionObj.evidence) : ''}" style="flex:2; min-width:150px;">
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

  // Gather planning metadata
  const projectName = document.getElementById('projectName')?.value || 'Not specified';
  const fmeaDate = document.getElementById('fmeaDate')?.value || now.toISOString().slice(0, 10);
  const fmeaTeam = document.getElementById('fmeaTeam')?.value || 'N/A';
  const fmeaType = document.getElementById('fmeaTypeSelector')?.value || 'DFMEA';
  const fmeaCustomer = document.getElementById('fmeaCustomer')?.value || 'N/A';
  const docNumber = document.getElementById('fmeaDocNumber')?.value || 'N/A';
  const revision = document.getElementById('fmeaRevision')?.value || 'N/A';
  const engResponsible = document.getElementById('fmeaEngResponsible')?.value || 'N/A';
  const plant = document.getElementById('fmeaPlant')?.value || 'N/A';
  const scope = document.getElementById('fmeaScope')?.value || 'N/A';
  const previousRef = document.getElementById('fmeaPreviousRef')?.value || 'N/A';

  const analysisInstance = document.createElement('div');
  analysisInstance.className = 'analysis-instance';
  const analysisNote = document.createElement('div');
  analysisNote.className = 'analysis-note';
  analysisNote.innerHTML = `<img src="sigma-exacta-icon.jpg" alt="Sigma Exacta Icon" style="width: 24px; height: 24px; border-radius: 50%;"><span><strong>Analysis #${analysisCounter}</strong> - ${timestamp} | ${fmeaType} | Doc: ${escapeHtml(docNumber)} Rev: ${escapeHtml(revision)} | Project: ${escapeHtml(projectName)} | Team: ${escapeHtml(fmeaTeam)}</span>`;
  analysisInstance.appendChild(analysisNote);

  const fmeaTable = document.createElement('table');
  fmeaTable.className = 'fmea-table';
  fmeaTable.innerHTML = `<thead><tr>
    <th>Function</th><th>Requirement</th><th>Unwanted</th><th>Focus Element</th>
    <th>Local Effect</th><th>Higher Level Effect</th><th>End Customer Effect</th><th>S</th>
    <th>Failure Mode</th><th>Cause</th>
    <th>Prevention Controls</th><th>O</th><th>Detection Controls</th><th>D</th>
    <th>AP</th><th>RPN</th>
    <th>Recommended Actions (Action / Responsible / Due / Status / Evidence)</th>
    <th>S2</th><th>O2</th><th>D2</th><th>AP2</th><th>RPN2</th>
    <th>Actions</th>
  </tr></thead><tbody></tbody>`;
  const fmeaTableBody = fmeaTable.querySelector('tbody');

  const optionsMap = {
    severity: [{ value: 1, text: "1-None" }, { value: 2, text: "2-Very Minor" }, { value: 3, text: "3-Minor" }, { value: 4, text: "4-Low" }, { value: 5, text: "5-Moderate" }, { value: 6, text: "6-Significant" }, { value: 7, text: "7-Major" }, { value: 8, text: "8-Extreme" }, { value: 9, text: "9-Serious" }, { value: 10, text: "10-Hazardous" }],
    occurrence: [{ value: 1, text: "1-Extremely Unlikely (<1 in 1M)" }, { value: 2, text: "2-Remote (1 in 150k)" }, { value: 3, text: "3-Very Low (1 in 15k)" }, { value: 4, text: "4-Low (1 in 2k)" }, { value: 5, text: "5-Moderate (1 in 400)" }, { value: 6, text: "6-Mod. High (1 in 80)" }, { value: 7, text: "7-High (1 in 20)" }, { value: 8, text: "8-Very High (1 in 8)" }, { value: 9, text: "9-Extremely High (1 in 3)" }, { value: 10, text: "10-Inevitable (≥1 in 2)" }],
    detection: [{ value: 1, text: "1-Certain Detection" }, { value: 2, text: "2-Very High Chance" }, { value: 3, text: "3-High Chance" }, { value: 4, text: "4-Mod. High Chance" }, { value: 5, text: "5-Moderate Chance" }, { value: 6, text: "6-Low Chance" }, { value: 7, text: "7-Very Low Chance" }, { value: 8, text: "8-Remote Chance" }, { value: 9, text: "9-Very Remote Chance" }, { value: 10, text: "10-No Chance" }]
  };

  // Helper to get focus element options (components with level component)
  const getFocusElementOptions = () => {
    const focusComponents = components.filter(c => c.level === 'component');
    let html = '<select class="focus-element-select">';
    html += '<option value="">Select focus element</option>';
    focusComponents.forEach(c => {
      html += `<option value="${c.id}">${escapeHtml(c.name)}</option>`;
    });
    html += '</select>';
    return html;
  };

  const addRow = (func, fm = null) => {
    const row = document.createElement('tr');
    row.className = 'fmea-data-row';
    const defaultFm = {
      mode: '', effectsLocal: '', effectsHigher: '', effectsEnd: '', severity: 1,
      causes: '', preventionControls: '', occurrence: 1, detectionControls: '', detection: 1,
      actions: [], focusElementId: ''
    };
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
      <td>${escapeHtml(func.requirement || '—')}</td>
      <td>${func.isUnwanted ? '⚠️ Yes' : 'No'}</td>
      <td>${getFocusElementOptions()}</td>
      <td><textarea rows="1" placeholder="Local effect (within focus element)">${escapeHtml(data.effectsLocal)}</textarea></td>
      <td><textarea rows="1" placeholder="Effect on higher level (system/subsystem)">${escapeHtml(data.effectsHigher)}</textarea></td>
      <td><textarea rows="1" placeholder="Effect on end customer / final user">${escapeHtml(data.effectsEnd)}</textarea></td>
      <td><select class="severity-select">${optionsMap.severity.map(opt => `<option value="${opt.value}" ${opt.value === s ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td><textarea rows="1" placeholder="Failure mode">${escapeHtml(data.mode)}</textarea></td>
      <td><textarea rows="1" placeholder="Cause (lower level)">${escapeHtml(data.causes)}</textarea></td>
      <td><textarea rows="1" placeholder="Prevention controls (design/process)">${escapeHtml(data.preventionControls)}</textarea></td>
      <td><select class="occurrence-select">${optionsMap.occurrence.map(opt => `<option value="${opt.value}" ${opt.value === o ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td><textarea rows="1" placeholder="Detection controls (test/inspection)">${escapeHtml(data.detectionControls)}</textarea></td>
      <td><select class="detection-select">${optionsMap.detection.map(opt => `<option value="${opt.value}" ${opt.value === d ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td class="ap-cell ${apClass}">${ap}</td>
      <td class="rpn-cell">${rpn}</td>
      <td class="actions-cell"></td>
      <td><select class="severity2-select">${optionsMap.severity.map(opt => `<option value="${opt.value}" ${opt.value === s2 ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td><select class="occurrence2-select">${optionsMap.occurrence.map(opt => `<option value="${opt.value}" ${opt.value === o2 ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td><select class="detection2-select">${optionsMap.detection.map(opt => `<option value="${opt.value}" ${opt.value === d2 ? 'selected' : ''}>${opt.text}</option>`).join('')}</select></td>
      <td class="ap2-cell ${ap2Class}">${ap2}</td>
      <td class="rpn2-cell">${rpn2}</td>
      <td><button class="delete-failure-mode" title="Delete"><i class="fas fa-trash"></i></button></td>
    `;

    // Set focus element if exists
    if (data.focusElementId) {
      const focusSelect = row.querySelector('.focus-element-select');
      if (focusSelect) focusSelect.value = data.focusElementId;
    }

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
    addRowBtnCell.colSpan = 23;
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

  // Add AP filter bar
  const filterBar = document.createElement('div');
  filterBar.className = 'ap-filter-bar';
  filterBar.innerHTML = `
    <span>Filter by AP:</span>
    <button class="filter-ap-all" style="background:#6c5ce7;">All</button>
    <button class="filter-ap-h" style="background:#e74c3c;">High (H)</button>
    <button class="filter-ap-m" style="background:#e67e22;">Medium (M)</button>
    <button class="filter-ap-l" style="background:#27ae60;">Low (L)</button>
  `;
  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'fmea-table-wrapper';
  tableWrapper.appendChild(fmeaTable);
  analysisInstance.appendChild(filterBar);
  analysisInstance.appendChild(tableWrapper);

  // Filter functionality
  const filterAll = filterBar.querySelector('.filter-ap-all');
  const filterH = filterBar.querySelector('.filter-ap-h');
  const filterM = filterBar.querySelector('.filter-ap-m');
  const filterL = filterBar.querySelector('.filter-ap-l');
  const filterRows = () => {
    const rows = fmeaTableBody.querySelectorAll('tr.fmea-data-row');
    rows.forEach(row => {
      const apCell = row.querySelector('.ap-cell');
      if (apCell) {
        const ap = apCell.textContent.trim();
        if (filterActive === 'H' && ap !== 'H') row.style.display = 'none';
        else if (filterActive === 'M' && ap !== 'M') row.style.display = 'none';
        else if (filterActive === 'L' && ap !== 'L') row.style.display = 'none';
        else row.style.display = '';
      }
    });
  };
  let filterActive = 'ALL';
  filterAll.addEventListener('click', () => { filterActive = 'ALL'; filterRows(); });
  filterH.addEventListener('click', () => { filterActive = 'H'; filterRows(); });
  filterM.addEventListener('click', () => { filterActive = 'M'; filterRows(); });
  filterL.addEventListener('click', () => { filterActive = 'L'; filterRows(); });

  const exportButton = document.createElement('button');
  exportButton.className = 'export-fmea-btn';
  exportButton.innerHTML = `<i class="fas fa-file-excel"></i> Export Analysis #${analysisCounter} to Excel`;
  exportButton.addEventListener('click', () => exportTableToExcel(fmeaTable, `FMEA_${fmeaType}_Analysis_${analysisCounter}_Sigma_Exacta.xlsx`, {
    docNumber, revision, projectName, fmeaDate, fmeaTeam, fmeaType, fmeaCustomer, engResponsible, plant, scope, previousRef
  }));
  analysisInstance.appendChild(exportButton);

  fmeaResultsContainer.appendChild(analysisInstance);
  fmeaResultsContainer.style.display = 'block';
  setTimeout(() => analysisInstance.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  refreshHeatmap();
}

function exportTableToExcel(tableElement, fileName, metadata) {
  const exportData = [];
  const headers = Array.from(tableElement.querySelectorAll('thead th')).map(th => th.textContent);
  tableElement.querySelectorAll('tbody tr.fmea-data-row').forEach(row => {
    const rowData = {};
    const cells = row.querySelectorAll('td');
    const getSelectText = (selectEl) => selectEl.options[selectEl.selectedIndex].text;
    rowData[headers[0]] = cells[0].textContent;
    rowData[headers[1]] = cells[1].textContent;
    rowData[headers[2]] = cells[2].textContent;
    rowData[headers[3]] = cells[3].querySelector('select')?.options[cells[3].querySelector('select')?.selectedIndex]?.text || '';
    rowData[headers[4]] = cells[4].querySelector('textarea').value;
    rowData[headers[5]] = cells[5].querySelector('textarea').value;
    rowData[headers[6]] = cells[6].querySelector('textarea').value;
    rowData[headers[7]] = getSelectText(cells[7].querySelector('select'));
    rowData[headers[8]] = cells[8].querySelector('textarea').value;
    rowData[headers[9]] = cells[9].querySelector('textarea').value;
    rowData[headers[10]] = cells[10].querySelector('textarea').value;
    rowData[headers[11]] = getSelectText(cells[11].querySelector('select'));
    rowData[headers[12]] = cells[12].querySelector('textarea').value;
    rowData[headers[13]] = getSelectText(cells[13].querySelector('select'));
    rowData[headers[14]] = cells[14].textContent;
    rowData[headers[15]] = cells[15].textContent;
    const actionsText = Array.from(cells[16].querySelectorAll('.action-item')).map(item => {
      const inputs = item.querySelectorAll('input');
      const status = item.querySelector('.action-status')?.value || '';
      return `Action: ${inputs[0].value} | Responsible: ${inputs[1].value} | Due: ${inputs[2].value} | Status: ${status} | Evidence: ${inputs[4]?.value || ''}`;
    }).join('; ');
    rowData[headers[16]] = actionsText;
    rowData[headers[17]] = getSelectText(cells[17].querySelector('select'));
    rowData[headers[18]] = getSelectText(cells[18].querySelector('select'));
    rowData[headers[19]] = getSelectText(cells[19].querySelector('select'));
    rowData[headers[20]] = cells[20].textContent;
    rowData[headers[21]] = cells[21].textContent;
    exportData.push(rowData);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 8 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 8 }, { wch: 25 }, { wch: 8 }, { wch: 5 }, { wch: 8 }, { wch: 50 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 5 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, ws, "FMEA Results");

  // Add metadata sheet
  const metaSheet = XLSX.utils.aoa_to_sheet([
    ['FMEA Document Metadata'],
    ['Document Number', metadata.docNumber],
    ['Revision', metadata.revision],
    ['Project Name', metadata.projectName],
    ['Date', metadata.fmeaDate],
    ['Team', metadata.fmeaTeam],
    ['FMEA Type', metadata.fmeaType],
    ['Customer', metadata.fmeaCustomer],
    ['Engineering Responsible', metadata.engResponsible],
    ['Plant/Location', metadata.plant],
    ['Scope & Assumptions', metadata.scope],
    ['Previous FMEA Reference', metadata.previousRef],
    ['AP Summary - High', exportData.filter(r => r['AP'] === 'H').length],
    ['AP Summary - Medium', exportData.filter(r => r['AP'] === 'M').length],
    ['AP Summary - Low', exportData.filter(r => r['AP'] === 'L').length]
  ]);
  XLSX.utils.book_append_sheet(wb, metaSheet, "Metadata");
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

  const container = document.getElementById('heatmapContainer');

  // Absolute color thresholds
  function getColorForCount(count) {
    if (count === 0) return '#eeeeee';
    if (count <= 2) return '#f1c40f';     // Amarillo
    if (count <= 5) return '#e67e22';     // Naranja
    return '#e74c3c';                     // Rojo
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
      const color = getColorForCount(count);
      return `<div class="heatmap-cell" style="background-color: ${color};" title="S:${severityValue}, O:${j + 1} → ${count} failure(s)">${count > 0 ? count : ''}</div>`;
    }).join('')}
              `;
  }).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="heatmap-legend">
      <span>⬤ 0 &nbsp; ⬤ 1-2 &nbsp; ⬤ 3-5 &nbsp; ⬤ >5</span><br>
      <small>Each cell shows the number of failure modes for that (Severity, Occurrence) pair.</small>
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

function exportHeatmapToExcel() {
  const data = getHeatmapData();
  if (!data) { alert('No FMEA data available. Generate an analysis first.'); return; }
  const header = ['S \\ O', ...Array.from({ length: 10 }, (_, i) => i + 1)];
  const sheetRows = [header];
  for (let i = 9; i >= 0; i--) { sheetRows.push([i + 1, ...data[i]]); }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetRows);
  ws['!cols'] = [{ wch: 10 }, ...Array(10).fill({ wch: 8 })];
  XLSX.utils.book_append_sheet(wb, ws, 'Risk Heatmap');
  XLSX.writeFile(wb, 'FMEA_Risk_Heatmap_Sigma_Exacta.xlsx');
}

function exportHeatmapToImage() {
  const data = getHeatmapData();
  if (!data) { alert('No FMEA data available. Generate an analysis first.'); return; }
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
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Occurrence', W / 2, 22);
  ctx.save();
  ctx.translate(14, H / 2 - legendH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Severity', 0, 0);
  ctx.restore();
  const originX = yTitleW + labelSize;
  const originY = titleH + labelSize;
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillStyle = '#2c3e50';
  ctx.textAlign = 'center';
  for (let j = 0; j < 10; j++) { ctx.fillText(j + 1, originX + j * cellSize + cellSize / 2, originY - 8); }
  ctx.textAlign = 'right';
  for (let i = 0; i < 10; i++) { ctx.fillText(10 - i, originX - 6, originY + i * cellSize + cellSize / 2 + 4); }
  for (let i = 0; i < 10; i++) {
    const sev = 10 - i;
    for (let j = 0; j < 10; j++) {
      const count = data[sev - 1][j];
      let color = '#eeeeee';
      if (count > 0) {
        if (count <= 2) color = '#f1c40f';
        else if (count <= 5) color = '#e67e22';
        else color = '#e74c3c';
      }
      ctx.fillStyle = color;
      ctx.fillRect(originX + j * cellSize, originY + i * cellSize, cellSize - 2, cellSize - 2);
      if (count > 0) {
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 13px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(count, originX + j * cellSize + cellSize / 2 - 1, originY + i * cellSize + cellSize / 2 + 5);
      }
    }
  }
  const legendY = originY + rows * cellSize + 14;
  const legendItems = [
    { color: '#eeeeee', label: '0' },
    { color: '#f1c40f', label: '1-2' },
    { color: '#e67e22', label: '3-5' },
    { color: '#e74c3c', label: '>5' }
  ];
  let lx = yTitleW + labelSize;
  ctx.font = '12px Arial, sans-serif';
  legendItems.forEach(item => {
    ctx.fillStyle = item.color;
    ctx.fillRect(lx, legendY, 14, 14);
    ctx.fillStyle = '#555555';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, lx + 18, legendY + 11);
    lx += 90;
  });
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/jpeg', 0.95);
  link.download = 'FMEA_Risk_Heatmap_Sigma_Exacta.jpg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}