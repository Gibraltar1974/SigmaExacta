// query-handler.js
// Sistema inteligente de manejo de parámetros URL para Sigma Exacta Engineering Tools
// Compatible con Taguchi DOE, Process Capability, Weibull Analysis, Tolerance Stack-Up y más

const QueryHandler = (function () {
    // Configuración de mapeo de campos por herramienta
    const toolFieldMappings = {
        'taguchi_doe': {
            name: 'Taguchi DOE Calculator',
            fieldMap: {
                'experiment-name': { selector: '#experiment-name', type: 'text', event: 'input' },
                'objective': { selector: '#objective', type: 'textarea', event: 'input' },
                'response-variable': { selector: '#response-variable', type: 'text', event: 'input' },
                'snr-type': {
                    selector: 'input[name="snr-type"]',
                    type: 'radio',
                    event: 'change',
                    process: function (value, element) {
                        const radio = document.querySelector(`input[name="snr-type"][value="${value}"]`);
                        if (radio) {
                            radio.checked = true;
                            // Mostrar/ocultar campo target
                            const targetGroup = document.getElementById('nominal-target-group');
                            if (targetGroup && value === 'nominal') {
                                targetGroup.classList.remove('hidden');
                            }
                            radio.dispatchEvent(new Event('change'));
                        }
                    }
                },
                'target': { selector: '#nominal-target', type: 'number', event: 'input' },
                'array': { selector: '#array-select', type: 'select', event: 'change' }
            },
            specialHandlers: {
                'factors': function (value) {
                    console.log('Procesando factores:', value);
                    // Formato: Factor1|Factor2|Factor3
                    const factors = value.split('|').map(f => f.trim());

                    // Limpiar factores existentes
                    const factorsContainer = document.getElementById('factors-container');
                    if (factorsContainer) {
                        factorsContainer.innerHTML = '';

                        // Agregar cada factor
                        factors.forEach(factorName => {
                            if (window.addFactorInput) {
                                window.addFactorInput(factorName, '');
                            } else {
                                // Crear elemento directamente si la función no está disponible
                                const factorDiv = document.createElement('div');
                                factorDiv.className = 'factor-inputs';
                                factorDiv.innerHTML = `
                                    <input type="text" class="factor-name" placeholder="Factor name" value="${factorName}" required>
                                    <input type="text" class="factor-levels" placeholder="Levels (comma separated)" value="" required>
                                    <button type="button" class="remove-factor btn-danger" title="Remove factor">
                                        <i class="fas fa-times"></i>
                                    </button>
                                `;
                                factorsContainer.appendChild(factorDiv);
                            }
                        });
                    }
                },
                'levels': function (value) {
                    console.log('Procesando niveles:', value);
                    // Formato: Level1,Level2|High,Low|TypeA,TypeB
                    const levelsArray = value.split('|').map(l => l.trim());

                    const levelInputs = document.querySelectorAll('.factor-levels');
                    levelInputs.forEach((input, index) => {
                        if (levelsArray[index]) {
                            input.value = levelsArray[index];
                            input.dispatchEvent(new Event('input'));
                        }
                    });
                },
                'results': function (value) {
                    console.log('Procesando resultados:', value);
                    // Formato: 10.2,9.8,12.1,11.5
                    const results = value.split(',').map(r => parseFloat(r.trim()));

                    // Esperar a que se genere la tabla
                    setTimeout(() => {
                        const responseInputs = document.querySelectorAll('.response-input');
                        responseInputs.forEach((input, index) => {
                            if (results[index] !== undefined && !isNaN(results[index])) {
                                input.value = results[index];
                                input.dispatchEvent(new Event('input'));
                                input.dispatchEvent(new Event('change'));
                            }
                        });
                    }, 500);
                }
            },
            postProcess: function (params) {
                // Generar diseño automáticamente si hay factores
                if (params.has('factors') && params.has('levels')) {
                    setTimeout(() => {
                        const generateBtn = document.getElementById('generate-design');
                        if (generateBtn) {
                            generateBtn.click();

                            // Ejecutar análisis si está configurado
                            if (params.get('auto_calculate') === 'true' || params.get('auto_calculate') === '1') {
                                setTimeout(() => {
                                    const calculateBtn = document.getElementById('calculate-analysis');
                                    if (calculateBtn) {
                                        calculateBtn.click();
                                    }
                                }, 1000);
                            }
                        }
                    }, 300);
                }
            }
        },
        'process_capability': {
            name: 'Process Capability Calculator',
            fieldMap: {
                'data': { selector: '#measurements-input', type: 'textarea', event: 'input' },
                'lsl': { selector: '#lsl-input', type: 'number', event: 'input' },
                'usl': { selector: '#usl-input', type: 'number', event: 'input' },
                'target': { selector: '#target-input', type: 'number', event: 'input' }
            }
        },
        'weibull_analysis': {
            name: 'Weibull Analysis',
            fieldMap: {
                'data': { selector: '#failure-times', type: 'textarea', event: 'input' }
            }
        },
        'control_plan': {
            name: 'Control Plan Creator',
            fieldMap: {
                // Campos genéricos que se mapearán dinámicamente
            }
        }
    };

    // Determinar la herramienta actual basándose en la URL
    function detectCurrentTool() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '').replace('.php', '');

        // Mapeo de páginas a herramientas
        const pageToTool = {
            'taguchi_doe': 'taguchi_doe',
            'cpk_calculator': 'process_capability',
            'weibull': 'weibull_analysis',
            'control-plan': 'control_plan',
            'stack_up_analysis': 'tolerance_stack_up',
            'pdca': 'pdca_cycle',
            'fmea': 'fmea',
            'qfd': 'qfd',
            'pugh': 'pugh_matrix',
            'vave': 'vave'
        };

        return pageToTool[page] || 'generic';
    }

    // Procesar parámetros URL y aplicar a campos
    function processURLParameters() {
        const params = new URLSearchParams(window.location.search);
        if (params.toString() === '') {
            console.log('No URL parameters found.');
            return;
        }

        console.log('Processing URL parameters:', Object.fromEntries(params));

        const currentTool = detectCurrentTool();
        console.log(`Detected tool: ${currentTool}`);

        const toolConfig = toolFieldMappings[currentTool];

        if (!toolConfig) {
            console.warn(`No configuration found for tool: ${currentTool}`);
            return;
        }

        // 1. Procesar mapeo de campos estándar
        if (toolConfig.fieldMap) {
            params.forEach((value, key) => {
                const fieldConfig = toolConfig.fieldMap[key];
                if (fieldConfig) {
                    const elements = document.querySelectorAll(fieldConfig.selector);
                    elements.forEach(element => {
                        if (fieldConfig.process) {
                            // Usar procesador personalizado si existe
                            fieldConfig.process(value, element);
                        } else {
                            // Procesamiento estándar
                            switch (fieldConfig.type) {
                                case 'text':
                                case 'textarea':
                                case 'number':
                                    element.value = value;
                                    if (fieldConfig.event) {
                                        element.dispatchEvent(new Event(fieldConfig.event));
                                    }
                                    break;
                                case 'radio':
                                    if (element.value === value) {
                                        element.checked = true;
                                        if (fieldConfig.event) {
                                            element.dispatchEvent(new Event(fieldConfig.event));
                                        }
                                    }
                                    break;
                                case 'checkbox':
                                    element.checked = (value === 'true' || value === '1' || value === 'on');
                                    if (fieldConfig.event) {
                                        element.dispatchEvent(new Event(fieldConfig.event));
                                    }
                                    break;
                                case 'select':
                                    element.value = value;
                                    if (fieldConfig.event) {
                                        element.dispatchEvent(new Event(fieldConfig.event));
                                    }
                                    break;
                            }
                        }
                        console.log(`Set ${key} = ${value} on ${fieldConfig.selector}`);
                    });
                }
            });
        }

        // 2. Procesar manejadores especiales
        if (toolConfig.specialHandlers) {
            params.forEach((value, key) => {
                const handler = toolConfig.specialHandlers[key];
                if (handler && typeof handler === 'function') {
                    try {
                        handler(value);
                        console.log(`Executed special handler for ${key}`);
                    } catch (error) {
                        console.error(`Error in special handler for ${key}:`, error);
                    }
                }
            });
        }

        // 3. Ejecutar post-procesamiento
        if (toolConfig.postProcess && typeof toolConfig.postProcess === 'function') {
            try {
                toolConfig.postProcess(params);
                console.log(`Executed post-process for ${currentTool}`);
            } catch (error) {
                console.error(`Error in post-process for ${currentTool}:`, error);
            }
        }

        // Mostrar indicador visual de parámetros cargados
        showParameterStatus(params.size, currentTool);
    }

    // Mostrar estado de parámetros cargados
    function showParameterStatus(paramCount, toolName) {
        if (paramCount === 0) return;

        // Crear o actualizar indicador
        let statusIndicator = document.getElementById('url-param-status');
        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.id = 'url-param-status';
            statusIndicator.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                background: #2ecc71;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 1000;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: slideIn 0.3s ease;
            `;

            // Añadir animación CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);

            document.body.appendChild(statusIndicator);

            // Auto-remover después de 5 segundos
            setTimeout(() => {
                statusIndicator.style.animation = 'fadeOut 0.5s ease';
                setTimeout(() => {
                    if (statusIndicator.parentNode) {
                        statusIndicator.parentNode.removeChild(statusIndicator);
                    }
                }, 500);
            }, 5000);
        }

        statusIndicator.innerHTML = `
            <i class="fas fa-link"></i>
            <div>
                <strong>${paramCount} URL parameter${paramCount !== 1 ? 's' : ''} loaded</strong>
                <div style="font-size: 12px; opacity: 0.9;">${toolName}</div>
            </div>
        `;
    }

    // Inicializar el sistema
    function initialize() {
        console.log('Query Handler initialized for Sigma Exacta Engineering Tools');

        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(processURLParameters, 500); // Pequeño retraso para elementos dinámicos
            });
        } else {
            setTimeout(processURLParameters, 500);
        }

        // También escuchar cambios en la URL (para SPA-like navigation)
        window.addEventListener('popstate', processURLParameters);
    }

    // API pública
    return {
        initialize: initialize,
        processParameters: processURLParameters,
        detectCurrentTool: detectCurrentTool,
        toolFieldMappings: toolFieldMappings
    };
})();

// Auto-inicialización cuando se carga el script
(function () {
    // Pequeño retraso para asegurar que el DOM esté listo
    setTimeout(() => {
        QueryHandler.initialize();
    }, 100);
})();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.QueryHandler = QueryHandler;
}

console.log('Query Handler v2.0 loaded - Sigma Exacta Engineering Tools');