// sufield-diagrams.js

// Función para agregar un nuevo sistema Su-Field
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
            
            <div class="sufield-system-diagram" id="sufield-diagram-${systemCount}">
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

// Función para eliminar un sistema Su-Field
function removeSuFieldSystem(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
    // Re-label remaining systems
    const container = document.getElementById('sufield-systems-container');
    const systems = container.getElementsByClassName('sufield-system');
    for (let i = 0; i < systems.length; i++) {
        const title = systems[i].querySelector('.sufield-system-title');
        if (title) {
            title.textContent = `Su-Field System ${i + 1}`;
        }
    }
    clearResults(); // Asegurarse de limpiar al borrar
}

// Función para actualizar el diagrama Su-Field
function updateSuFieldDiagram(systemElement) {
    if (!systemElement) return;

    const object = systemElement.querySelector('.sufield-object').value || 'S1';
    const tool = systemElement.querySelector('.sufield-tool').value || 'S2';
    const field = systemElement.querySelector('.sufield-field').value || 'F';
    const type = systemElement.querySelector('.sufield-type').value || 'insufficient';
    const diagramElement = systemElement.querySelector('.sufield-system-diagram');

    // Limpiar contenido existente
    diagramElement.innerHTML = '';

    // Función auxiliar mejorada para truncar texto
    function truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Coordenadas de los nodos (ligeramente ajustadas para más espacio)
    const s1 = { x: 110, y: 30, r: 22 };
    const s2 = { x: 50, y: 160, r: 22 };
    const f = { x: 170, y: 160, r: 22 };

    // Calcular puntos de intersección para las flechas
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

    const s1ToS2Start = getCircleIntersection(s1.x, s1.y, s1.r, s2.x, s2.y);
    const s1ToS2End = getCircleIntersection(s2.x, s2.y, s2.r, s1.x, s1.y);
    const s1ToFStart = getCircleIntersection(s1.x, s1.y, s1.r, f.x, f.y);
    const s1ToFEnd = getCircleIntersection(f.x, f.y, f.r, s1.x, s1.y);
    const s2ToFStart = getCircleIntersection(s2.x, s2.y, s2.r, f.x, f.y);
    const s2ToFEnd = getCircleIntersection(f.x, f.y, f.r, s2.x, s2.y);

    // Crear diagrama SVG mejorado
    const diagramHTML = `
        <div class="sufield-triangle-container">
            <div class="sufield-svg-container problem-${type}">
                <svg class="sufield-svg" viewBox="0 0 220 190">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                                refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#3498db"/>
                        </marker>
                    </defs>
                    
                    <polygon points="110,30 50,160 170,160" class="triangle-path"/>
                    
                    <line x1="${s1ToS2Start.x}" y1="${s1ToS2Start.y}" x2="${s1ToS2End.x}" y2="${s1ToS2End.y}" class="interaction-line"/>
                    <line x1="${s1ToFStart.x}" y1="${s1ToFStart.y}" x2="${s1ToFEnd.x}" y2="${s1ToFEnd.y}" class="interaction-line"/>
                    <line x1="${s2ToFStart.x}" y1="${s2ToFStart.y}" x2="${s2ToFEnd.x}" y2="${s2ToFEnd.y}" class="interaction-line"/>
                    
                    <circle cx="${s1.x}" cy="${s1.y}" r="${s1.r}" class="sufield-node s1-node"/>
                    <circle cx="${s2.x}" cy="${s2.y}" r="${s2.r}" class="sufield-node s2-node"/>
                    <circle cx="${f.x}" cy="${f.y}" r="${f.r}" class="sufield-node f-node"/>
                    
                    <rect x="${s1.x - 25}" y="${s1.y - 8}" width="50" height="16" rx="3" class="text-background"/>
                    <rect x="${s2.x - 25}" y="${s2.y - 8}" width="50" height="16" rx="3" class="text-background"/>
                    <rect x="${f.x - 25}" y="${f.y - 8}" width="50" height="16" rx="3" class="text-background"/>
                    
                    <text x="${s1.x}" y="${s1.y}" class="node-label">${truncateText(object, 10)}</text>
                    <text x="${s2.x}" y="${s2.y}" class="node-label">${truncateText(tool, 10)}</text>
                    <text x="${f.x}" y="${f.y}" class="node-label">${truncateText(field, 10)}</text>
                    
                    <text x="${s1.x}" y="${s1.y + 28}" class="node-type">Object (S1)</text>
                    <text x="${s2.x}" y="${s2.y + 28}" class="node-type">Tool (S2)</text>
                    <text x="${f.x}" y="${f.y + 28}" class="node-type">Field (F)</text>
                    
                    <foreignObject x="95" y="95" width="30" height="30">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas ${problemTypeIcons[type]} problem-indicator-icon" style="color: ${problemTypeColors[type]}; font-size: 1.8rem;"></i>
                        </div>
                    </foreignObject>
                </svg>
            </div>
        </div>
    `;

    diagramElement.innerHTML = diagramHTML;
}