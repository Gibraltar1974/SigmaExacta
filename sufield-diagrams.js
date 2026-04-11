// sufield-diagrams.js - ARCHIVO FINAL MODIFICADO CON MEJORAS RESPONSIVAS Y FALLBACK

// --- FUNCIÓN AUXILIAR MEJORADA ---
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    const isMobile = window.innerWidth <= 768;
    const mobileMaxLength = isMobile ? Math.floor(maxLength * 0.7) : maxLength;
    const actualMaxLength = isMobile ? mobileMaxLength : maxLength;
    return text.substring(0, actualMaxLength) + '...';
}

// ----------------------------------------------------------------------
// --- FUNCIÓN CENTRAL DE DIBUJO (GARANTIZA HOMOGENEIDAD VISUAL) ---
// ----------------------------------------------------------------------
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

    // --- Fallbacks si las variables globales no están definidas ---
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

    // --- CONFIGURACIÓN DE COORDENADAS ---
    const f = { x: 110, y: 40, r: 28 };
    const s2 = { x: 50, y: 170, r: 28 };
    const s1 = { x: 170, y: 170, r: 28 };

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

    const fToS1Start = getCircleIntersection(f.x, f.y, f.r, s1.x, s1.y);
    const fToS1End = getCircleIntersection(s1.x, s1.y, s1.r, f.x, f.y);
    const fToS2Start = getCircleIntersection(f.x, f.y, f.r, s2.x, s2.y);
    const fToS2End = getCircleIntersection(s2.x, s2.y, s2.r, f.x, f.y);
    const s1ToS2Start = getCircleIntersection(s1.x, s1.y, s1.r, s2.x, s2.y);
    const s1ToS2End = getCircleIntersection(s2.x, s2.y, s2.r, s1.x, s1.y);

    const centerX = (s1.x + s2.x + f.x) / 3;
    const centerY = (s1.y + s2.y + f.y) / 3;

    // Fallback textual para el icono
    const fallbackLetter = systemType ? systemType.charAt(0).toUpperCase() : '?';
    const fallbackColor = colorStyle;

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
                    
                    <text x="${f.x}" y="${f.y - f.r - 8}" class="node-type" text-anchor="middle" style="font-size: 10px; fill: #555; font-weight: normal;">${truncateText(fieldType || 'Unspecified', 15)}</text>
                    <text x="${s2.x}" y="${s2.y + s2.r + 20}" class="node-type" text-anchor="middle" style="font-size: 10px; fill: #555; font-weight: normal;">${truncateText(toolText, 15)}</text>
                    <text x="${s1.x}" y="${s1.y + s1.r + 20}" class="node-type" text-anchor="middle" style="font-size: 10px; fill: #555; font-weight: normal;">${truncateText(objectText, 15)}</text>
                    
                    <foreignObject x="${centerX - 15}" y="${centerY - 15}" width="30" height="30">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative;">
                            <i class="fas ${iconClass}" style="color: ${colorStyle}; font-size: 1.5rem; background: rgba(255,255,255,0.9); border-radius: 50%;"></i>
                            <span style="position: absolute; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-weight: bold; color: white; background: ${fallbackColor}; border-radius: 50%; font-family: Arial; font-size: 14px; opacity: 0;" class="icon-fallback">${fallbackLetter}</span>
                        </div>
                    </foreignObject>
                </svg>
            </div>
        </div>
    `;

    diagramElement.innerHTML = diagramHTML;
}

// ----------------------------------------------------------------------
// --- FUNCIONES DE INTERFAZ PÚBLICA ---
// ----------------------------------------------------------------------
function updateSuFieldDiagram(systemElement) {
    if (!systemElement) return;
    const diagramElementId = systemElement.querySelector('.sufield-system-diagram').id;
    const objectText = systemElement.querySelector('.sufield-object').value || 'The Object';
    const toolText = systemElement.querySelector('.sufield-tool').value || 'The Tool';
    const fieldType = systemElement.querySelector('.sufield-field').value;
    const type = systemElement.querySelector('.sufield-type').value || 'insufficient';
    _drawSuFieldDiagram(diagramElementId, objectText, toolText, fieldType, type);
}

function updateProblemDiagramInSolution(targetElementId, problemData) {
    _drawSuFieldDiagram(
        targetElementId,
        problemData.objectText || 'Original Object',
        problemData.toolText || 'Original Tool',
        problemData.fieldType || 'Other',
        problemData.problemType || 'insufficient'
    );
}

function updateSolutionDiagram(targetElementId, objectText, toolText, fieldType) {
    _drawSuFieldDiagram(targetElementId, objectText, toolText, fieldType, 'solution');
}

function removeSuFieldSystem(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
    const container = document.getElementById('sufield-systems-container');
    const systems = container.getElementsByClassName('sufield-system');
    for (let i = 0; i < systems.length; i++) {
        const title = systems[i].querySelector('.sufield-system-title');
        if (title) title.textContent = `Su-Field System ${i + 1}`;
    }
    if (typeof clearResults === 'function') clearResults();
}

// La función addSuFieldSystem está definida en triz.html