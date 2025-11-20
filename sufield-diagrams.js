// sufield-diagrams.js - ARCHIVO FINAL MODIFICADO CON MEJORAS RESPONSIVAS

// --- FUNCIÓN AUXILIAR MEJORADA ---
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    
    // Para móviles, truncar más agresivamente
    const isMobile = window.innerWidth <= 768;
    const mobileMaxLength = isMobile ? Math.floor(maxLength * 0.7) : maxLength;
    const actualMaxLength = isMobile ? mobileMaxLength : maxLength;
    
    return text.substring(0, actualMaxLength) + '...';
}

// ----------------------------------------------------------------------
// --- FUNCIÓN CENTRAL DE DIBUJO (GARANTIZA HOMOGENEIDAD VISUAL) ---
// ----------------------------------------------------------------------

/**
 * Dibuja un diagrama Su-Field con un estilo visual consistente (homogéneo).
 * ESTA FUNCIÓN ESTABLECE EL ESTILO IDÉNTICO PARA EL PROBLEMA Y LA SOLUCIÓN.
 * @param {string} targetElementId - El ID del contenedor donde se insertará el SVG.
 * @param {string} objectText - Descripción del S1.
 * @param {string} toolText - Descripción del S2.
 * @param {string} fieldType - Tipo de campo (ej: 'Mechanical').
 * @param {string} systemType - Tipo de problema (ej: 'harmful', 'insufficient', o 'solution').
 */
function _drawSuFieldDiagram(targetElementId, objectText, toolText, fieldType, systemType) {
    const diagramElement = document.getElementById(targetElementId);
    if (!diagramElement) return;

    // --- Definición de estilos de línea por tipo de problema ---
    const lineStyles = {
        insufficient: { color: '#3498db', dasharray: 'none' },
        harmful: { color: '#e74c3c', dasharray: '5,5' },
        difficult: { color: '#f39c12', dasharray: '2,2' },
        missing: { color: '#95a5a6', dasharray: '10,5' },
        excessive: { color: '#9b59b6', dasharray: '10,5,2,5' },
        inefficient: { color: '#1abc9c', dasharray: '5,5,2,5' },
        solution: { color: '#00C853', dasharray: 'none' }
    };

    const lineStyle = lineStyles[systemType] || { color: '#666', dasharray: 'none' };

    // --- Definición de Fallbacks si las variables globales no están definidas (SOLUCIÓN AL SyntaxError) ---
    const defaultFieldAbbreviations = {
        'Mechanical': 'Fmech', 'Thermal': 'Ftherm', 'Electrical': 'Felec', 'Magnetic': 'Fmag',
        'Optical': 'Fopt', 'Acoustic': 'Faco', 'Chemical': 'Fchem', 'Gravitational': 'Fgrav',
        'Nuclear': 'Fnuc', 'Biological': 'Fbio', 'Other': 'Fother'
    };
    const defaultNodeColors = { 'S1': '#4CAF50', 'S2': '#2196F3', 'F': '#FF9800' };
    const defaultProblemTypeIcons = {
        'insufficient': 'fa-arrow-down', 'harmful': 'fa-skull',
        'difficult': 'fa-ruler-combined', 'missing': 'fa-times', 'excessive': 'fa-arrow-up',
        'inefficient': 'fa-hourglass-half', 'solution': 'fa-check-circle'
    };
    const defaultProblemTypeColors = {
        'insufficient': '#3498db', 'harmful': '#e74c3c', 'difficult': '#f39c12',
        'missing': '#95a5a6', 'excessive': '#9b59b6', 'inefficient': '#1abc9c', 'solution': '#00C853'
    };

    const fieldAbbrs = (typeof fieldAbbreviations !== 'undefined' && fieldAbbreviations) || defaultFieldAbbreviations;
    const colors = (typeof nodeColors !== 'undefined' && nodeColors) || defaultNodeColors;
    const icons = (typeof problemTypeIcons !== 'undefined' && problemTypeIcons) || defaultProblemTypeIcons;
    const colors_center = (typeof problemTypeColors !== 'undefined' && problemTypeColors) || defaultProblemTypeColors;

    const fieldLabel = fieldAbbrs[fieldType] || 'F';
    const objectLabel = 'S1';
    const toolLabel = 'S2';
    
    const iconClass = icons[systemType] ? icons[systemType] : 'fa-exclamation-circle';
    const colorStyle = colors_center[systemType] ? colors_center[systemType] : '#333';

    diagramElement.innerHTML = '';

    // --- CONFIGURACIÓN DE COORDENADAS (ESTÁNDAR) ---
    const f = { x: 110, y: 40, r: 28 };
    const s2 = { x: 50, y: 170, r: 28 };
    const s1 = { x: 170, y: 170, r: 28 };

    // Calcular puntos de intersección para las líneas
    function getCircleIntersection(cx, cy, r, tx, ty) {
        const dx = tx - cx;
        const dy = ty - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / distance;
        const ny = dy / distance;
        const ix = cx + nx * r;
        const iy = cy + ny * r;
        return { x: ix, y: iy };
    }

    // Calculamos las intersecciones
    const fToS1Start = getCircleIntersection(f.x, f.y, f.r, s1.x, s1.y);
    const fToS1End = getCircleIntersection(s1.x, s1.y, s1.r, f.x, f.y);
    const fToS2Start = getCircleIntersection(f.x, f.y, f.r, s2.x, s2.y);
    const fToS2End = getCircleIntersection(s2.x, s2.y, s2.r, f.x, f.y);
    const s1ToS2Start = getCircleIntersection(s1.x, s1.y, s1.r, s2.x, s2.y);
    const s1ToS2End = getCircleIntersection(s2.x, s2.y, s2.r, s1.x, s1.y);

    const centerX = (s1.x + s2.x + f.x) / 3;
    const centerY = (s1.y + s2.y + f.y) / 3;

    // 2. Generación del Diagrama SVG (Estilo Homogéneo y Responsivo)
    const diagramHTML = `
        <div class="sufield-triangle-container" style="width: 100%; max-width: 100%; margin: 0 auto; overflow: hidden;">
            <div class="sufield-svg-container system-${systemType}" style="width: 100%; max-width: 100%;">
                <svg class="sufield-svg" viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="overflow: visible; max-width: 100%;"> 
                    
                    <line x1="${fToS1Start.x}" y1="${fToS1Start.y}" x2="${fToS1End.x}" y2="${fToS1End.y}" class="interaction-line" style="stroke: ${lineStyle.color}; stroke-width: 2; stroke-dasharray: ${lineStyle.dasharray};"/>
                    <line x1="${fToS2Start.x}" y1="${fToS2Start.y}" x2="${fToS2End.x}" y2="${fToS2End.y}" class="interaction-line" style="stroke: ${lineStyle.color}; stroke-width: 2; stroke-dasharray: ${lineStyle.dasharray};"/>
                    <line x1="${s1ToS2Start.x}" y1="${s1ToS2Start.y}" x2="${s1ToS2End.x}" y2="${s1ToS2End.y}" class="interaction-line" style="stroke: ${lineStyle.color}; stroke-width: 2; stroke-dasharray: ${lineStyle.dasharray};"/>
                    
                    <circle cx="${f.x}" cy="${f.y}" r="${f.r}" class="sufield-node f-node" style="fill: ${colors['F']}; stroke: #333; stroke-width: 2;"/>
                    <circle cx="${s2.x}" cy="${s2.y}" r="${s2.r}" class="sufield-node s2-node" style="fill: ${colors['S2']}; stroke: #333; stroke-width: 2;"/>
                    <circle cx="${s1.x}" cy="${s1.y}" r="${s1.r}" class="sufield-node s1-node" style="fill: ${colors['S1']}; stroke: #333; stroke-width: 2;"/>
                    
                    <text x="${f.x}" y="${f.y}" class="node-label" dominant-baseline="middle" text-anchor="middle" style="font-size: 11px; font-family: Arial; font-weight: bold; fill: white;">${fieldLabel}</text>
                    <text x="${s2.x}" y="${s2.y}" class="node-label" dominant-baseline="middle" text-anchor="middle" style="font-size: 11px; font-family: Arial; font-weight: bold; fill: white;">${toolLabel}</text>
                    <text x="${s1.x}" y="${s1.y}" class="node-label" dominant-baseline="middle" text-anchor="middle" style="font-size: 11px; font-family: Arial; font-weight: bold; fill: white;">${objectLabel}</text>
                    
                    <!-- Textos simplificados sin etiquetas y con mejor posicionamiento -->
                    <text x="${f.x}" y="${f.y - f.r - 8}" class="node-type" text-anchor="middle" style="font-size: 10px; fill: #555; font-weight: normal;">${truncateText(fieldType || 'Unspecified', 15)}</text>
                    <text x="${s2.x}" y="${s2.y + s2.r + 20}" class="node-type" text-anchor="middle" style="font-size: 10px; fill: #555; font-weight: normal;">${truncateText(toolText, 15)}</text>
                    <text x="${s1.x}" y="${s1.y + s1.r + 20}" class="node-type" text-anchor="middle" style="font-size: 10px; fill: #555; font-weight: normal;">${truncateText(objectText, 15)}</text>
                    
                    <foreignObject x="${centerX - 15}" y="${centerY - 15}" width="30" height="30">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas ${iconClass}" style="color: ${colorStyle}; font-size: 1.5rem; background: rgba(255,255,255,0.9); border-radius: 50%;"></i>
                        </div>
                    </foreignObject>
                </svg>
            </div>
        </div>
    `;

    diagramElement.innerHTML = diagramHTML;
}

// ----------------------------------------------------------------------
// --- FUNCIONES DE INTERFAZ PÚBLICA (USADAS EN EL HTML) ---
// ----------------------------------------------------------------------

// FUNCIÓN PARA LA DEFINICIÓN DEL PROBLEMA (encima del botón 'Solve')
function updateSuFieldDiagram(systemElement) {
    if (!systemElement) return;

    const diagramElementId = systemElement.querySelector('.sufield-system-diagram').id;

    const objectText = systemElement.querySelector('.sufield-object').value || 'The Object';
    const toolText = systemElement.querySelector('.sufield-tool').value || 'The Tool';
    const fieldType = systemElement.querySelector('.sufield-field').value;
    const type = systemElement.querySelector('.sufield-type').value || 'insufficient'; // Tipo de problema

    // Llama a la función central con el estilo homogéneo.
    _drawSuFieldDiagram(diagramElementId, objectText, toolText, fieldType, type);
}

// FUNCIÓN PARA EL DIAGRAMA DEL PROBLEMA EN LA VISTA DE SOLUCIÓN
/**
 * Genera el diagrama del Problema dentro de la sección de Solución.
 * (Debe ser idéntico al diagrama de la Definición del Problema).
 * @param {string} targetElementId - ID del contenedor del diagrama del problema en la solución.
 * @param {object} problemData - Objeto con {objectText, toolText, fieldType, problemType}.
 */
function updateProblemDiagramInSolution(targetElementId, problemData) {
    _drawSuFieldDiagram(
        targetElementId, 
        problemData.objectText || 'Original Object', 
        problemData.toolText || 'Original Tool', 
        problemData.fieldType || 'Other', 
        problemData.problemType || 'insufficient' // Muestra el tipo de problema original
    );
}

// FUNCIÓN PARA EL DIAGRAMA DE LA SOLUCIÓN
/**
 * Genera el diagrama de Su-Field de la SOLUCIÓN.
 * (Mismo estilo, pero con los parámetros de la solución y el icono de éxito).
 * @param {string} targetElementId - ID del contenedor donde se dibujará la SOLUCIÓN.
 * @param {string} objectText - Nueva descripción del Objeto (S1' o S1 original).
 * @param {string} toolText - Nueva descripción de la Herramienta (S2' o S2 original).
 * @param {string} fieldType - Nuevo tipo de campo (F' o F original).
 */
function updateSolutionDiagram(targetElementId, objectText, toolText, fieldType) {
    // Usa 'solution' para activar el icono de checkmark/éxito (mismo estilo)
    const type = 'solution'; 
    _drawSuFieldDiagram(targetElementId, objectText, toolText, fieldType, type);
}

// Funciones básicas de gestión de sistemas
function removeSuFieldSystem(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
    const container = document.getElementById('sufield-systems-container');
    const systems = container.getElementsByClassName('sufield-system');
    for (let i = 0; i < systems.length; i++) {
        const title = systems[i].querySelector('.sufield-system-title');
        if (title) {
            title.textContent = `Su-Field System ${i + 1}`;
        }
    }
    if (typeof clearResults === 'function') {
        clearResults();
    }
}

function addSuFieldSystem() {
    const container = document.getElementById('sufield-systems-container');
    const systemCount = container.children.length;
    const systemId = 'sufield-system-' + systemCount;

    const systemHTML = `
        <div class="sufield-system" id="${systemId}">
            <div class="sufield-system-header">
                <div class="sufield-system-title">Su-Field System ${systemCount + 1}</div>
                <button type="button" class="btn-warning" onclick="removeSuFieldSystem('${systemId}')" aria-label="Remove system"><i class="fas fa-minus"></i></button>
            </div>
            
            <div class="sufield-system-fields">
                <div class="form-group">
                    <label for="sufield-object-${systemCount}">Object (S1)</label>
                    <input type="text" id="sufield-object-${systemCount}" class="sufield-object" placeholder="e.g., The coffee, the user's hand" oninput="updateSuFieldDiagram(this.parentElement.parentElement.parentElement); clearResults();">
                </div>
                <div class="form-group">
                    <label for="sufield-tool-${systemCount}">Tool (S2)</label>
                    <input type="text" id="sufield-tool-${systemCount}" class="sufield-tool" placeholder="e.g., The mug wall, the robot arm" oninput="updateSuFieldDiagram(this.parentElement.parentElement.parentElement); clearResults();">
                </div>
                <div class="form-group">
                    <label for="sufield-field-${systemCount}">Field (F)</label>
                    <select id="sufield-field-${systemCount}" class="sufield-field" onchange="updateSuFieldDiagram(this.parentElement.parentElement.parentElement); clearResults();">
                        <option value="">Select a field type</option>
                        <option value="Mechanical">Mechanical (Force, Pressure)</option>
                        <option value="Thermal">Thermal (Heat, Cold)</option>
                        <option value="Electrical">Electrical (Current, Voltage)</option>
                        <option value="Magnetic">Magnetic (Field, Flux)</option>
                        <option value="Optical">Optical (Light, Radiation)</option>
                        <option value="Acoustic">Acoustic (Sound, Vibration)</option>
                        <option value="Chemical">Chemical (Reaction, Bond)</option>
                        <option value="Gravitational">Gravitational (Weight, Mass)</option>
                        <option value="Nuclear">Nuclear (Radiation, Decay)</option>
                        <option value="Biological">Biological (Growth, Metabolism)</option>
                        <option value="Other">Other (Specify in text)</option>
                    </select>
                </div>
            </div>
            
            <div class="sufield-system-diagram" id="sufield-diagram-${systemCount}" style="width: 100%; max-width: 100%; overflow: hidden;">
            </div>
            
            <div class="form-group">
                <label for="sufield-type-${systemCount}">Problem Type:</label>
                <select id="sufield-type-${systemCount}" class="sufield-type" onchange="updateSuFieldDiagram(this.parentElement.parentElement); clearResults();">
                    <option value="insufficient">Useful, but insufficient</option>
                    <option value="harmful">Harmful or undesired</option>
                    <option value="difficult">Difficult to measure or detect</option>
                    <option value="missing">Missing entirely</option>
                    <option value="excessive">Excessive or too much</option>
                    <option value="inefficient">Inefficient or wasteful</option>
                </select>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', systemHTML);
    updateSuFieldDiagram(document.getElementById(systemId));
}

// FUNCIÓN displayResults MEJORADA PARA RESPONSIVIDAD
function displayResults() {
    const resultsDiv = document.getElementById('results-container');
    let html = '<h3><i class="fas fa-check-circle"></i> Solution Path Report</h3>';

    html += `<div class="solver-step"><h4><i class="fas fa-atom"></i> Su-Field Analysis & Standard Solutions</h4>`;

    problemData.sufield.systems.forEach((system, index) => {
        // Solo mostrar sistemas que tengan al menos un campo rellenado
        if (system.object || system.tool || system.field) {
            html += `<div style="margin-bottom: 2rem; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; word-wrap: break-word; overflow-wrap: break-word;">`;

            // Mostrar el diagrama Su-Field usando la función centralizada
            html += `<h5 style="word-wrap: break-word; overflow-wrap: break-word;">System ${index + 1}: ${system.object || 'S1'} ← ${system.field || 'F'} → ${system.tool || 'S2'}</h5>`;
            
            // Crear contenedores para los diagramas de problema y solución
            const problemDiagramId = `problem-diagram-${index}`;
            const solutionDiagramId = `solution-diagram-${index}`;
            
            html += `
                <div class="solution-transformation" style="width: 100%; max-width: 100%; overflow: hidden;">
                    <div class="before-state" style="flex: 1; min-width: 0;">
                        <div id="${problemDiagramId}" class="sufield-diagram-container" style="width: 100%; max-width: 100%;"></div>
                        <div class="state-label">Problem State</div>
                    </div>
                    
                    <div class="transition-arrow"><i class="fas fa-long-arrow-alt-right"></i></div>
                    
                    <div class="after-state" style="flex: 1; min-width: 0;">
                        <div id="${solutionDiagramId}" class="sufield-diagram-container" style="width: 100%; max-width: 100%;"></div>
                        <div class="state-label">Solution State</div>
                    </div>
                </div>
            `;

            // Show problem type with visual indicator
            html += `<div style="display: flex; align-items: center; margin-bottom: 1rem; word-wrap: break-word; overflow-wrap: break-word;">
                <i class="fas ${problemTypeIcons[system.type]}" style="font-size: 1.5rem; color: ${problemTypeColors[system.type]}; margin-right: 10px;"></i>
                <div style="word-wrap: break-word; overflow-wrap: break-word;">
                    <strong>Problem Type:</strong> ${system.type}
                    <p style="margin: 5px 0 0 0; word-wrap: break-word; overflow-wrap: break-word;">${system.suggestion}</p>
                </div>
            </div>`;

            if (system.standardSolutions && system.standardSolutions.length > 0) {
                // Group solutions by class
                const solutionsByClass = {};
                system.standardSolutions.forEach(solution => {
                    if (!solutionsByClass[solution.class]) {
                        solutionsByClass[solution.class] = [];
                    }
                    solutionsByClass[solution.class].push(solution);
                });

                // Display solutions by class with explanations
                for (const [className, solutions] of Object.entries(solutionsByClass)) {
                    const classIcon = classIcons[className] || 'fa-cube';
                    html += `<div class="standard-solution-visual" style="word-wrap: break-word; overflow-wrap: break-word;">`;
                    html += `
                        <div class="class-header">
                            <span class="class-icon"><i class="fas ${classIcon}"></i></span>
                            <h5 style="word-wrap: break-word; overflow-wrap: break-word;">${className}</h5>
                        </div>
                    `;
                    html += `<p style="word-wrap: break-word; overflow-wrap: break-word;">${standardSolutionClasses[className] || 'Standard solutions for this class of problems.'}</p>`;

                    html += `<div class="solution-description" style="word-wrap: break-word; overflow-wrap: break-word;">`;
                    html += `<h6 style="word-wrap: break-word; overflow-wrap: break-word;">Recommended Standard Solutions:</h6>`;

                    solutions.forEach(solution => {
                        const solutionIcon = standardSolutionIcons[solution.id] || 'fa-cube';
                        html += `
                            <div class="solution-card" style="word-wrap: break-word; overflow-wrap: break-word;">
                                <div class="solution-header">
                                    <span class="standard-solution-icon"><i class="fas ${solutionIcon}"></i></span>
                                    <strong style="word-wrap: break-word; overflow-wrap: break-word;">${solution.id}: ${solution.title}</strong>
                                </div>
                                <p style="word-wrap: break-word; overflow-wrap: break-word;">${solution.description}</p>
                            </div>
                        `;
                    });

                    html += `</div></div>`;
                }
            } else if (typeof getRecommendedStandardSolutions !== 'function') {
                html += `<p><em>Error: 76principlestriz.js not loaded. Cannot display standard solutions.</em></p>`;
            } else {
                html += `<p><em>No standard solutions found for "${system.type}".</em></p>`;
            }

            html += `</div>`;
        }
    });
    html += `</div>`;

    html += `<div class="results-actions"><button class="btn-success" onclick="exportToExcel()"><i class="fas fa-file-excel"></i> Export to Excel</button></div>`;

    resultsDiv.innerHTML = html;
    resultsDiv.classList.remove('hidden');
    
    // DESPUÉS de insertar el HTML, llamar a las funciones para dibujar los diagramas
    problemData.sufield.systems.forEach((system, index) => {
        if (system.object || system.tool || system.field) {
            const problemDiagramId = `problem-diagram-${index}`;
            const solutionDiagramId = `solution-diagram-${index}`;
            
            // Dibujar diagrama del problema
            updateProblemDiagramInSolution(problemDiagramId, {
                objectText: system.object,
                toolText: system.tool, 
                fieldType: system.field,
                problemType: system.type
            });
            
            // Dibujar diagrama de la solución (usando los mismos datos por ahora)
            updateSolutionDiagram(
                solutionDiagramId, 
                system.object, 
                system.tool, 
                system.field
            );
        }
    });
    
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}