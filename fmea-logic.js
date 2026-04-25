// fmea-logic.js - AIAG-VDA 2019 Compliant (Action Priority fully updated)
// Enhanced with full Excel export/import, locked mode, revision history, and inline editing

let components = [];
let contacts = [];
let functions = [];
let network = null;
let analysisCounter = 0;
let revisions = []; // { date, reviewer, analysisNumber }

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
  document.getElementById('generateFMEABtn').addEventListener('click', promptRevisionAndRegenerate);
  document.getElementById('exportChartBtn').addEventListener('click', exportChart);
  document.getElementById('clearComponentsBtn').addEventListener('click', resetAll);
  document.getElementById('clearContactsBtn').addEventListener('click', () => { contacts = []; functions = []; contactCounter = 0; primaryFunctionCounter = 0; secondaryFunctionCounter = 0; updateAll(); });
  document.getElementById('clearFunctionsBtn').addEventListener('click', () => { functions = []; primaryFunctionCounter = 0; secondaryFunctionCounter = 0; updateAll(); });
  document.getElementById('fitViewBtn').addEventListener('click', () => { if (network) network.fit({ animation: true }); });

  // --- LÓGICA DE BOTONES PRINCIPALES ---
  document.getElementById('globalNewBtn').addEventListener('click', () => {
    resetAll();
    switchTab('tab-planning');
  });

  document.getElementById('globalLoadExampleBtn').addEventListener('click', loadExample);

  document.getElementById('globalReviseBtn').addEventListener('click', () => {
    // "Edit Input Data": bloquea la tabla (si existe) y va a Planning
    const lastAnalysis = document.querySelector('#fmeaResultsContainer .analysis-instance:last-child');
    if (lastAnalysis) {
      const table = lastAnalysis.querySelector('.fmea-table');
      if (table && !table.classList.contains('locked')) {
        table.classList.add('locked');
      }
    }
    switchTab('tab-planning');
  });

  // LOAD MODAL
  document.getElementById('globalLoadBtn').addEventListener('click', () => {
    document.getElementById('loadFileLabel').textContent = 'No file selected';
    document.getElementById('modalFileInput').value = '';
    document.getElementById('loadModal').classList.add('show');
  });
  document.getElementById('loadCancelBtn').addEventListener('click', () => {
    document.getElementById('loadModal').classList.remove('show');
  });
  document.getElementById('loadModal').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('show');
  });
  document.getElementById('modalFileInput').addEventListener('change', function () {
    document.getElementById('loadFileLabel').textContent = this.files[0] ? this.files[0].name : 'No file selected';
  });
  document.getElementById('loadConfirmBtn').addEventListener('click', () => {
    const file = document.getElementById('modalFileInput').files[0];
    if (!file) { alert('Please select an Excel file first.'); return; }
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        loadFromExcel(workbook);
        document.getElementById('loadModal').classList.remove('show');
        showNotification('FMEA loaded successfully from Excel! (Read-only mode)');
      } catch (err) {
        console.error('Error loading Excel file:', err);
        alert('Error loading file: ' + err.message);
      }
    };
    reader.onerror = () => alert('Error reading the file. Please try again.');
    reader.readAsArrayBuffer(file);
  });

  // EXPORT MODAL
  document.getElementById('globalExportBtn').addEventListener('click', () => {
    if (!document.querySelector('#fmeaResultsContainer .analysis-instance')) {
      alert('Please generate at least one FMEA analysis before exporting.');
      return;
    }
    document.getElementById('exportModal').classList.add('show');
  });
  document.getElementById('exportCancelBtn').addEventListener('click', () => {
    document.getElementById('exportModal').classList.remove('show');
  });
  document.getElementById('exportModal').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('show');
  });
  document.getElementById('exportConfirmBtn').addEventListener('click', () => {
    document.getElementById('exportModal').classList.remove('show');
    exportFullFMEA();
  });

  // REVISION MODAL – ahora regenera la tabla con los datos actuales
  document.getElementById('revisionCancelBtn').addEventListener('click', () => {
    document.getElementById('revisionModal').classList.remove('show');
  });
  document.getElementById('revisionModal').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('show');
  });
  document.getElementById('revisionConfirmBtn').addEventListener('click', () => {
    const date = document.getElementById('revisionDate').value;
    const reviewer = document.getElementById('revisionReviewer').value.trim();
    if (!date || !reviewer) {
      alert('Please enter both date and reviewer name.');
      return;
    }
    document.getElementById('revisionModal').classList.remove('show');
    // Guardar los modos de fallo actuales en el array functions antes de regenerar
    saveCurrentFailureModesToFunctions();
    // Registrar revisión
    revisions.push({ date, reviewer, analysisNumber: analysisCounter + 1 });
    // Generar tabla nueva (editable) con los datos de entrada y los modos de fallo preservados
    generateFMEA({ locked: false });
    document.getElementById('revisionDate').value = '';
    document.getElementById('revisionReviewer').value = '';
    switchTab('tab-results');
  });

  document.getElementById('exportHeatmapExcelBtn')?.addEventListener('click', exportHeatmapToExcel);
  document.getElementById('exportHeatmapImageBtn')?.addEventListener('click', exportHeatmapToImage);
  document.getElementById('showCriteriaBtn')?.addEventListener('click', showCriteriaModal);

  updateAll();
}

function promptRevisionAndRegenerate() {
  if (functions.length === 0) {
    alert('Please define at least one function first.');
    return;
  }
  document.getElementById('revisionModal').classList.add('show');
}

// Extrae los datos de la última tabla FMEA y los guarda en el array functions (failureModes de cada función)
function saveCurrentFailureModesToFunctions() {
  const lastAnalysis = document.querySelector('#fmeaResultsContainer .analysis-instance:last-child');
  if (!lastAnalysis) return;
  const rows = lastAnalysis.querySelectorAll('.fmea-table tbody tr.fmea-data-row');
  if (rows.length === 0) return;

  // Reiniciar failureModes de todas las funciones
  functions.forEach(f => { f.failureModes = []; });

  rows.forEach(row => {
    const funcCell = row.cells[0]?.textContent || '';
    const funcLabel = funcCell.split(':')[0].trim();  // ej: "fp1"
    const func = functions.find(f => f.label === funcLabel);
    if (!func) return;

    // Leer valores de la fila
    const focusSelect = row.querySelector('.focus-element-select');
    const focusElementId = focusSelect ? focusSelect.value : '';

    const fm = {
      mode: row.querySelector('td:nth-child(9) textarea')?.value || '',
      effectsLocal: row.querySelector('td:nth-child(5) textarea')?.value || '',
      effectsHigher: row.querySelector('td:nth-child(6) textarea')?.value || '',
      effectsEnd: row.querySelector('td:nth-child(7) textarea')?.value || '',
      severity: parseInt(row.querySelector('.severity-select')?.value) || 1,
      causes: row.querySelector('td:nth-child(10) textarea')?.value || '',
      preventionControls: row.querySelector('td:nth-child(11) textarea')?.value || '',
      occurrence: parseInt(row.querySelector('.occurrence-select')?.value) || 1,
      detectionControls: row.querySelector('td:nth-child(13) textarea')?.value || '',
      detection: parseInt(row.querySelector('.detection-select')?.value) || 1,
      actions: [],
      focusElementId: focusElementId
    };

    // Acciones (si las hay)
    const actionItems = row.querySelectorAll('.actions-cell .action-item');
    actionItems.forEach(item => {
      const inputs = item.querySelectorAll('input');
      const action = inputs[0]?.value || '';
      const responsible = inputs[1]?.value || '';
      const dueDate = inputs[2]?.value || '';
      const status = item.querySelector('.action-status')?.value || 'Open';
      const evidence = inputs[4]?.value || '';
      fm.actions.push({ action, responsible, dueDate, status, evidence });
    });

    func.failureModes.push(fm);
  });
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background-color: #2ecc71; color: white;
    padding: 15px 20px; border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000; max-width: 300px; font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.5s ease';
    setTimeout(() => document.body.removeChild(notification), 500);
  }, 3000);
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

// ----- DATA MANAGEMENT -----
function loadExample() {
  resetAll();
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
    generateFMEA({ locked: true });
    switchTab('tab-results');
    document.querySelector('.tabs-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function resetAll() {
  components = []; contacts = []; functions = [];
  contactCounter = 0; primaryFunctionCounter = 0; secondaryFunctionCounter = 0;
  analysisCounter = 0;
  revisions = [];
  fmeaResultsContainer.innerHTML = '<div class="calculation-title">FMEA Results (AIAG-VDA Compliant)</div>';
  document.getElementById('heatmapContainer').innerHTML = '<p>No FMEA data available. Generate an analysis first.</p>';
  if (network) { network.destroy(); network = null; }
  document.getElementById('projectName').value = '';
  document.getElementById('fmeaDate').value = '';
  document.getElementById('fmeaTeam').value = '';
  document.getElementById('fmeaTypeSelector').value = 'DFMEA';
  document.getElementById('fmeaCustomer').value = '';
  document.getElementById('fmeaDocNumber').value = '';
  document.getElementById('fmeaRevision').value = '';
  document.getElementById('fmeaEngResponsible').value = '';
  document.getElementById('fmeaPlant').value = '';
  document.getElementById('fmeaScope').value = '';
  document.getElementById('fmeaPreviousRef').value = '';
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

/* ====================== EDITABLES ====================== */
function startEditComponent(itemDiv, comp) {
  // Replace name display with input
  const displaySpan = itemDiv.querySelector('.name-display');
  const input = itemDiv.querySelector('.edit-name-input');
  const editBtn = itemDiv.querySelector('.edit-btn');
  const deleteBtn = itemDiv.querySelector('.delete-btn');
  if (!displaySpan || !input) return;

  displaySpan.style.display = 'none';
  input.style.display = 'inline-block';
  input.focus();
  editBtn.innerHTML = '<i class="fas fa-check"></i>';
  editBtn.classList.add('save-btn');
  editBtn.removeEventListener('click', editHandler);
  editBtn.addEventListener('click', saveHandler);

  function saveHandler(e) {
    e.stopPropagation();
    const newName = input.value.trim();
    if (newName) {
      comp.name = newName;
      updateAll(); // re-render list
    } else {
      // revert
      input.value = comp.name;
      cancelEdit();
    }
  }

  function cancelEdit() {
    displaySpan.style.display = '';
    input.style.display = 'none';
    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    editBtn.classList.remove('save-btn');
    editBtn.removeEventListener('click', saveHandler);
    editBtn.addEventListener('click', editHandler);
  }

  function editHandler(e) {
    e.stopPropagation();
    startEditComponent(itemDiv, comp);
  }

  // On blur save (if not cancelled)
  input.addEventListener('blur', () => {
    setTimeout(() => {
      // If still in edit mode, save
      if (input.style.display !== 'none') {
        const newName = input.value.trim();
        if (newName && newName !== comp.name) {
          comp.name = newName;
          updateAll();
        } else {
          cancelEdit();
        }
      }
    }, 100);
  });

  // Enter key saves
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    }
  });
}

function startEditContact(itemDiv, cont) {
  const displaySpan = itemDiv.querySelector('.name-display');
  const input = itemDiv.querySelector('.edit-name-input');
  const typeSelect = itemDiv.querySelector('.edit-type-select');
  const editBtn = itemDiv.querySelector('.edit-btn');
  const deleteBtn = itemDiv.querySelector('.delete-btn');

  displaySpan.style.display = 'none';
  input.style.display = 'inline-block';
  typeSelect.style.display = 'inline-block';
  input.focus();
  editBtn.innerHTML = '<i class="fas fa-check"></i>';
  editBtn.classList.add('save-btn');
  editBtn.removeEventListener('click', editHandler);
  editBtn.addEventListener('click', saveHandler);

  function saveHandler(e) {
    e.stopPropagation();
    const newName = input.value.trim();
    const newType = typeSelect.value;
    if (newName) {
      cont.name = newName;
      cont.interactionType = newType;
      updateAll();
    } else {
      cancelEdit();
    }
  }

  function cancelEdit() {
    displaySpan.style.display = '';
    input.style.display = 'none';
    typeSelect.style.display = 'none';
    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    editBtn.classList.remove('save-btn');
    editBtn.removeEventListener('click', saveHandler);
    editBtn.addEventListener('click', editHandler);
  }

  function editHandler(e) {
    e.stopPropagation();
    startEditContact(itemDiv, cont);
  }

  input.addEventListener('blur', () => {
    setTimeout(() => {
      if (input.style.display !== 'none') {
        const newName = input.value.trim();
        if (newName && newName !== cont.name) {
          cont.name = newName;
          updateAll();
        } else {
          cancelEdit();
        }
      }
    }, 100);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    }
  });
}

function startEditFunction(itemDiv, func) {
  const displaySpan = itemDiv.querySelector('.func-display');
  const editArea = itemDiv.querySelector('.func-edit-area');
  const nameInput = itemDiv.querySelector('.edit-func-name');
  const reqInput = itemDiv.querySelector('.edit-func-req');
  const typeSelect = itemDiv.querySelector('.edit-func-type');
  const unwantedCheck = itemDiv.querySelector('.edit-func-unwanted');
  const editBtn = itemDiv.querySelector('.edit-btn');
  const deleteBtn = itemDiv.querySelector('.delete-btn');

  displaySpan.style.display = 'none';
  editArea.style.display = 'block';
  nameInput.focus();
  editBtn.innerHTML = '<i class="fas fa-check"></i>';
  editBtn.classList.add('save-btn');
  editBtn.removeEventListener('click', editHandler);
  editBtn.addEventListener('click', saveHandler);

  function saveHandler(e) {
    e.stopPropagation();
    const newName = nameInput.value.trim();
    const newReq = reqInput.value.trim();
    const newType = typeSelect.value;
    const newUnwanted = unwantedCheck.checked;
    if (newName) {
      func.name = newName;
      func.requirement = newReq;
      func.type = newType;
      func.isUnwanted = newUnwanted;
      // Update label if type changed? keep original label
      updateAll();
    } else {
      cancelEdit();
    }
  }

  function cancelEdit() {
    displaySpan.style.display = '';
    editArea.style.display = 'none';
    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    editBtn.classList.remove('save-btn');
    editBtn.removeEventListener('click', saveHandler);
    editBtn.addEventListener('click', editHandler);
  }

  function editHandler(e) {
    e.stopPropagation();
    startEditFunction(itemDiv, func);
  }
}

/* ====================== FIN EDITABLES ====================== */

function updateComponentsList() {
  componentsList.innerHTML = '';
  components.forEach(component => {
    const item = document.createElement('div'); item.className = 'item';
    const parentName = component.parentId ? (components.find(c => c.id === component.parentId)?.name || '?') : '';
    item.innerHTML = `
      <div class="item-name">
        <span class="name-display">${component.name} (${component.level})${component.external ? ' [External]' : ''}${component.parentId ? ' → parent: ' + parentName : ''}</span>
        <input class="edit-name-input" style="display:none" value="${escapeHtml(component.name)}">
        <div class="item-actions">
          <button class="edit-btn" title="Edit"><i class="fas fa-pencil-alt"></i></button>
          <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
    item.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      startEditComponent(item, component);
    });
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
      item.innerHTML = `
        <div class="item-name">
          <span class="name-display"><strong>${contact.name}</strong> (${contact.interactionType}): ${from.name} → ${to.name}</span>
          <input class="edit-name-input" style="display:none" value="${escapeHtml(contact.name)}">
          <select class="edit-type-select" style="display:none">
            <option value="Signal" ${contact.interactionType === 'Signal' ? 'selected' : ''}>Signal</option>
            <option value="Force" ${contact.interactionType === 'Force' ? 'selected' : ''}>Force</option>
            <option value="Energy" ${contact.interactionType === 'Energy' ? 'selected' : ''}>Energy</option>
            <option value="Material" ${contact.interactionType === 'Material' ? 'selected' : ''}>Material</option>
            <option value="Information" ${contact.interactionType === 'Information' ? 'selected' : ''}>Information</option>
          </select>
          <div class="item-actions">
            <button class="edit-btn" title="Edit"><i class="fas fa-pencil-alt"></i></button>
            <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      item.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        startEditContact(item, contact);
      });
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
    item.innerHTML = `
      <div class="item-name">
        <div class="func-display">
          <strong>${func.label}:</strong> ${func.name} (${func.type})${func.requirement ? '<br><small>Req: ' + escapeHtml(func.requirement) + '</small>' : ''}${func.isUnwanted ? '<br><small>⚠️ Unwanted function</small>' : ''}<br><small>Contacts: ${contactNames}</small>
        </div>
        <div class="func-edit-area" style="display:none">
          <label>Name: <input type="text" class="edit-func-name" value="${escapeHtml(func.name)}" style="width:100%;"></label>
          <label>Requirement: <input type="text" class="edit-func-req" value="${escapeHtml(func.requirement || '')}" style="width:100%;"></label>
          <label>Type: <select class="edit-func-type">
            <option value="primary" ${func.type === 'primary' ? 'selected' : ''}>Primary</option>
            <option value="secondary" ${func.type === 'secondary' ? 'selected' : ''}>Secondary</option>
          </select></label>
          <label>Unwanted: <input type="checkbox" class="edit-func-unwanted" ${func.isUnwanted ? 'checked' : ''}></label>
        </div>
        <div class="item-actions">
          <button class="edit-btn" title="Edit"><i class="fas fa-pencil-alt"></i></button>
          <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
    item.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      startEditFunction(item, func);
    });
    item.querySelector('.delete-btn').addEventListener('click', () => {
      functions = functions.filter(f => f.id !== func.id);
      updateAll();
    });
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

function getActionPriority(s, o, d) {
  if (s < 1 || s > 10 || o < 1 || o > 10 || d < 1 || d > 10) throw new Error('S, O, D must be between 1 and 10');
  if (s === 1 || o === 1) return 'L';
  if (s >= 9) { if (o >= 6) return 'H'; if (o >= 4) return d === 1 ? 'M' : 'H'; if (d >= 7) return 'H'; if (d >= 5) return 'M'; return 'L'; }
  if (s >= 7) { if (o >= 8) return 'H'; if (o >= 6) return d === 1 ? 'M' : 'H'; if (o >= 4) return d >= 7 ? 'H' : 'M'; if (d >= 5) return 'M'; return 'L'; }
  if (s >= 4) { if (o >= 8) return d >= 7 ? 'H' : 'M'; if (o >= 6) return d >= 2 ? 'M' : 'L'; if (o >= 4) return d >= 7 ? 'M' : 'L'; return 'L'; }
  if (s >= 2) { if (o >= 8) return d >= 5 ? 'M' : 'L'; return 'L'; }
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

function generateFMEA(options = {}) {
  const { locked = false, revisionInfo = null } = options;
  analysisCounter++;
  const now = new Date();
  const timestamp = `${now.toLocaleDateString('en-US')}, ${now.toLocaleTimeString('en-US', { hour12: true })}`;

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

  if (revisions.length > 0) {
    const revHistoryDiv = document.createElement('div');
    revHistoryDiv.className = 'revision-history';
    revHistoryDiv.innerHTML = `<strong>📋 Revision History</strong><ul>` +
      revisions.map(r => `<li>Rev. by ${escapeHtml(r.reviewer)} on ${r.date} (Analysis #${r.analysisNumber})</li>`).join('') +
      `</ul>`;
    analysisInstance.appendChild(revHistoryDiv);
  }

  const analysisNote = document.createElement('div');
  analysisNote.className = 'analysis-note';
  analysisNote.innerHTML = `<img src="sigma-exacta-icon.jpg" alt="Sigma Exacta Icon" style="width: 24px; height: 24px; border-radius: 50%;"><span><strong>Analysis #${analysisCounter}</strong> - ${timestamp} | ${fmeaType} | Doc: ${escapeHtml(docNumber)} Rev: ${escapeHtml(revision)} | Project: ${escapeHtml(projectName)} | Team: ${escapeHtml(fmeaTeam)}</span>`;
  analysisInstance.appendChild(analysisNote);

  const fmeaTable = document.createElement('table');
  fmeaTable.className = 'fmea-table' + (locked ? ' locked' : '');
  fmeaTable.innerHTML = `<thead><tr>
    <th>Function</th><th>Requirement</th><th>Unwanted</th><th>Focus Element</th>
    <th>Local Effect</th><th>Higher Level Effect</th><th>End Customer Effect</th><th>S</th>
    <th>Failure Mode</th><th>Cause</th>
    <th>Prevention Controls</th><th>O</th><th>Detection Controls</th><th>D</th>
    <th>AP</th><th>RPN</th>
    <th>Recommended Actions</th>
    <th>S2</th><th>O2</th><th>D2</th><th>AP2</th><th>RPN2</th>
    <th>Actions</th>
  </table></thead><tbody></tbody>`;
  const fmeaTableBody = fmeaTable.querySelector('tbody');

  const optionsMap = {
    severity: [{ value: 1, text: "1-None" }, { value: 2, text: "2-Very Minor" }, { value: 3, text: "3-Minor" }, { value: 4, text: "4-Low" }, { value: 5, text: "5-Moderate" }, { value: 6, text: "6-Significant" }, { value: 7, text: "7-Major" }, { value: 8, text: "8-Extreme" }, { value: 9, text: "9-Serious" }, { value: 10, text: "10-Hazardous" }],
    occurrence: [{ value: 1, text: "1-Extremely Unlikely (<1 in 1M)" }, { value: 2, text: "2-Remote (1 in 150k)" }, { value: 3, text: "3-Very Low (1 in 15k)" }, { value: 4, text: "4-Low (1 in 2k)" }, { value: 5, text: "5-Moderate (1 in 400)" }, { value: 6, text: "6-Mod. High (1 in 80)" }, { value: 7, text: "7-High (1 in 20)" }, { value: 8, text: "8-Very High (1 in 8)" }, { value: 9, text: "9-Extremely High (1 in 3)" }, { value: 10, text: "10-Inevitable (≥1 in 2)" }],
    detection: [{ value: 1, text: "1-Certain Detection" }, { value: 2, text: "2-Very High Chance" }, { value: 3, text: "3-High Chance" }, { value: 4, text: "4-Mod. High Chance" }, { value: 5, text: "5-Moderate Chance" }, { value: 6, text: "6-Low Chance" }, { value: 7, text: "7-Very Low Chance" }, { value: 8, text: "8-Remote Chance" }, { value: 9, text: "9-Very Remote Chance" }, { value: 10, text: "10-No Chance" }]
  };

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

  // Generar filas a partir del array functions, usando failureModes pre-cargados
  functions.forEach(func => {
    if (func.failureModes && func.failureModes.length > 0) {
      func.failureModes.forEach(fm => addRow(func, fm));
    } else {
      // Al menos una fila vacía por función
      addRow(func, null);
    }
    // Botón para añadir más modos de fallo a esta función
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

  const filterAll = filterBar.querySelector('.filter-ap-all');
  const filterH = filterBar.querySelector('.filter-ap-h');
  const filterM = filterBar.querySelector('.filter-ap-m');
  const filterL = filterBar.querySelector('.filter-ap-l');
  let filterActive = 'ALL';
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
  filterAll.addEventListener('click', () => { filterActive = 'ALL'; filterRows(); });
  filterH.addEventListener('click', () => { filterActive = 'H'; filterRows(); });
  filterM.addEventListener('click', () => { filterActive = 'M'; filterRows(); });
  filterL.addEventListener('click', () => { filterActive = 'L'; filterRows(); });

  const exportButton = document.createElement('button');
  exportButton.className = 'export-fmea-btn';
  exportButton.innerHTML = `<i class="fas fa-file-excel"></i> Export Analysis #${analysisCounter} to Excel`;
  exportButton.addEventListener('click', () => exportTableToExcel(fmeaTable, `FMEA_${fmeaType}_Analysis_${analysisCounter}_Sigma_Exacta.xlsx`, {
    docNumber, revision, projectName, fmeaDate, fmeaTeam, fmeaType, fmeaCustomer, engResponsible, plant, scope, previousRef, revisions
  }));
  analysisInstance.appendChild(exportButton);

  fmeaResultsContainer.appendChild(analysisInstance);
  fmeaResultsContainer.style.display = 'block';
  setTimeout(() => analysisInstance.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  refreshHeatmap();
}

function loadFromExcel(workbook) {
  resetAll();

  if (workbook.Sheets['Planning']) {
    const planningSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Planning'], { header: 1 });
    for (const row of planningSheet) {
      if (row[0] === 'Project Name') document.getElementById('projectName').value = row[1] || '';
      if (row[0] === 'Date') document.getElementById('fmeaDate').value = row[1] || '';
      if (row[0] === 'Team / Responsible') document.getElementById('fmeaTeam').value = row[1] || '';
      if (row[0] === 'FMEA Type') document.getElementById('fmeaTypeSelector').value = row[1] || 'DFMEA';
      if (row[0] === 'Customer / System') document.getElementById('fmeaCustomer').value = row[1] || '';
      if (row[0] === 'Document Number') document.getElementById('fmeaDocNumber').value = row[1] || '';
      if (row[0] === 'Revision') document.getElementById('fmeaRevision').value = row[1] || '';
      if (row[0] === 'Engineering Responsible') document.getElementById('fmeaEngResponsible').value = row[1] || '';
      if (row[0] === 'Plant / Location') document.getElementById('fmeaPlant').value = row[1] || '';
      if (row[0] === 'Scope & Assumptions') document.getElementById('fmeaScope').value = row[1] || '';
      if (row[0] === 'Previous FMEA Reference') document.getElementById('fmeaPreviousRef').value = row[1] || '';
    }
  }

  if (workbook.Sheets['Components']) {
    const compSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Components'], { header: 1 });
    for (let i = 1; i < compSheet.length; i++) {
      const r = compSheet[i];
      if (r[0]) {
        components.push({
          id: parseInt(r[0]),
          name: r[1] || '',
          level: r[2] || 'component',
          parentId: r[3] ? parseInt(r[3]) : null,
          external: r[4] === 'Yes'
        });
      }
    }
  }

  if (workbook.Sheets['Contacts']) {
    const contSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Contacts'], { header: 1 });
    for (let i = 1; i < contSheet.length; i++) {
      const r = contSheet[i];
      if (r[0]) {
        contacts.push({
          id: parseInt(r[0]),
          from: parseInt(r[1]),
          to: parseInt(r[2]),
          name: r[3] || '',
          interactionType: r[4] || 'Signal'
        });
      }
    }
    contactCounter = contacts.length;
  }

  if (workbook.Sheets['Functions']) {
    const funcSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Functions'], { header: 1 });
    for (let i = 1; i < funcSheet.length; i++) {
      const r = funcSheet[i];
      if (r[0]) {
        let failureModes = [];
        try { failureModes = JSON.parse(r[7] || '[]'); } catch (e) { failureModes = []; }
        const fType = r[4] || 'primary';
        functions.push({
          id: parseInt(r[0]),
          name: r[1] || '',
          requirement: r[2] || '',
          isUnwanted: r[3] === 'Yes',
          type: fType,
          label: r[5] || '',
          contacts: (r[6] || '').split(',').map(Number).filter(n => !isNaN(n)),
          failureModes: failureModes
        });
        if (fType === 'primary') primaryFunctionCounter++;
        else secondaryFunctionCounter++;
      }
    }
  }

  updateAll();
  generateFMEA({ locked: true });
  switchTab('tab-results');
}

function exportFullFMEA() {
  const wb = XLSX.utils.book_new();

  const planningData = [
    ['FMEA Planning Data'],
    ['Project Name', document.getElementById('projectName')?.value || ''],
    ['Date', document.getElementById('fmeaDate')?.value || ''],
    ['Team / Responsible', document.getElementById('fmeaTeam')?.value || ''],
    ['FMEA Type', document.getElementById('fmeaTypeSelector')?.value || 'DFMEA'],
    ['Customer / System', document.getElementById('fmeaCustomer')?.value || ''],
    ['Document Number', document.getElementById('fmeaDocNumber')?.value || ''],
    ['Revision', document.getElementById('fmeaRevision')?.value || ''],
    ['Engineering Responsible', document.getElementById('fmeaEngResponsible')?.value || ''],
    ['Plant / Location', document.getElementById('fmeaPlant')?.value || ''],
    ['Scope & Assumptions', document.getElementById('fmeaScope')?.value || ''],
    ['Previous FMEA Reference', document.getElementById('fmeaPreviousRef')?.value || '']
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(planningData), 'Planning');

  const compData = [['ID', 'Name', 'Level', 'Parent ID', 'External']];
  components.forEach(c => compData.push([c.id, c.name, c.level, c.parentId || '', c.external ? 'Yes' : 'No']));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(compData), 'Components');

  const contData = [['ID', 'From', 'To', 'Name', 'Interaction Type']];
  contacts.forEach(c => contData.push([c.id, c.from, c.to, c.name, c.interactionType]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(contData), 'Contacts');

  const funcData = [['ID', 'Name', 'Requirement', 'Is Unwanted', 'Type', 'Label', 'Contact IDs', 'Failure Modes (JSON)']];
  functions.forEach(f => funcData.push([f.id, f.name, f.requirement || '', f.isUnwanted ? 'Yes' : 'No', f.type, f.label, f.contacts.join(','), JSON.stringify(f.failureModes || [])]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(funcData), 'Functions');

  const lastAnalysis = document.querySelector('#fmeaResultsContainer .analysis-instance:last-child');
  if (lastAnalysis) {
    const fmeaTable = lastAnalysis.querySelector('.fmea-table');
    if (fmeaTable) {
      const exportData = [];
      const headers = Array.from(fmeaTable.querySelectorAll('thead th')).map(th => th.textContent);
      fmeaTable.querySelectorAll('tbody tr.fmea-data-row').forEach(row => {
        const rowData = {};
        const cells = row.querySelectorAll('td');
        const getSelectText = (selectEl) => selectEl ? selectEl.options[selectEl.selectedIndex]?.text || '' : '';
        headers.forEach((h, i) => {
          if (i === 3) rowData[h] = cells[3]?.querySelector('select')?.options[cells[3].querySelector('select')?.selectedIndex]?.text || '';
          else if ([4, 5, 6, 8, 9, 10, 12].includes(i)) rowData[h] = cells[i]?.querySelector('textarea')?.value || '';
          else if ([7, 11, 13, 17, 18, 19].includes(i)) rowData[h] = getSelectText(cells[i]?.querySelector('select'));
          else if (i === 16) {
            rowData[h] = Array.from(cells[16]?.querySelectorAll('.action-item') || []).map(item => {
              const inputs = item.querySelectorAll('input');
              const status = item.querySelector('.action-status')?.value || '';
              return `Action: ${inputs[0]?.value || ''} | Resp: ${inputs[1]?.value || ''} | Due: ${inputs[2]?.value || ''} | Status: ${status} | Evidence: ${inputs[4]?.value || ''}`;
            }).join('; ');
          } else {
            rowData[h] = cells[i]?.textContent || '';
          }
        });
        exportData.push(rowData);
      });
      if (exportData.length > 0) {
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, 'FMEA_Results');
      }
    }
  }

  if (revisions.length > 0) {
    const revData = [['Date', 'Reviewer', 'Analysis Number']];
    revisions.forEach(r => revData.push([r.date, r.reviewer, r.analysisNumber]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(revData), 'Revision_History');
  }

  const fileName = `FMEA_${document.getElementById('projectName')?.value || 'Export'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
  showNotification('FMEA exported successfully to Excel!');
}

function exportTableToExcel(tableElement, fileName, metadata) {
  const exportData = [];
  const headers = Array.from(tableElement.querySelectorAll('thead th')).map(th => th.textContent);
  tableElement.querySelectorAll('tbody tr.fmea-data-row').forEach(row => {
    const rowData = {};
    const cells = row.querySelectorAll('td');
    const getSelectText = (selectEl) => selectEl ? selectEl.options[selectEl.selectedIndex]?.text || '' : '';
    headers.forEach((h, i) => {
      if (i === 3) rowData[h] = cells[3]?.querySelector('select')?.options[cells[3].querySelector('select')?.selectedIndex]?.text || '';
      else if ([4, 5, 6, 8, 9, 10, 12].includes(i)) rowData[h] = cells[i]?.querySelector('textarea')?.value || '';
      else if ([7, 11, 13, 17, 18, 19].includes(i)) rowData[h] = getSelectText(cells[i]?.querySelector('select'));
      else if (i === 16) {
        rowData[h] = Array.from(cells[16]?.querySelectorAll('.action-item') || []).map(item => {
          const inputs = item.querySelectorAll('input');
          const status = item.querySelector('.action-status')?.value || '';
          return `Action: ${inputs[0]?.value || ''} | Resp: ${inputs[1]?.value || ''} | Due: ${inputs[2]?.value || ''} | Status: ${status} | Evidence: ${inputs[4]?.value || ''}`;
        }).join('; ');
      } else {
        rowData[h] = cells[i]?.textContent || '';
      }
    });
    exportData.push(rowData);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 8 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 8 }, { wch: 25 }, { wch: 8 }, { wch: 5 }, { wch: 8 }, { wch: 50 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 5 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, ws, "FMEA Results");

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

  function getColorForCount(count) {
    if (count === 0) return '#eeeeee';
    if (count <= 2) return '#f1c40f';
    if (count <= 5) return '#e67e22';
    return '#e74c3c';
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

function exportChart() {
  const canvas = document.querySelector('#networkCanvas canvas');
  if (canvas && network) {
    const dataURL = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a'); link.href = dataURL; link.download = 'fmea_structure_chart.jpg';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  } else alert('The chart is not available to be exported.');
}