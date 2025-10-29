// Global variables
let dimensionCount = 0;
let chart = null;
let calculationHistory = [];
let calculationCount = 0;
let vectorOrientation = 'horizontal';

// Mathematical functions
function gamma(z) { 
    if (z <= 0) return Infinity;
    if (z === 0.5) return Math.sqrt(Math.PI);
    
    const g = 7;
    const C = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 
               771.32342877765313, -176.61502916214059, 12.507343278686905, 
               -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    
    if (z < 0.5) {
        return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    }
    
    z -= 1;
    let x = C[0];
    for (let i = 1; i < g + 2; i++) {
        x += C[i] / (z + i);
    }
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// ===== INTELLIGENT VALIDATION SYSTEM =====
class DistributionValidator {
    static validateDistribution(nominal, distribution, params) {
        const errors = [];
        const warnings = [];
        
        switch(distribution) {
            case 'normal':
                return this.validateNormal(nominal, params);
            case 'lognormal':
                return this.validateLognormal(nominal, params);
            case 'weibull':
                return this.validateWeibull(nominal, params);
            case 'beta':
                return this.validateBeta(nominal, params);
            case 'exponential':
                return this.validateExponential(nominal, params);
            case 'triangular':
                return this.validateTriangular(nominal, params);
            case 'homo':
                return this.validateUniform(nominal, params);
            default:
                return { isValid: true, errors, warnings };
        }
    }

    static validateNormal(nominal, params) {
        const errors = [];
        const warnings = [];
        
        if (params.paramType === 'tolerance') {
            const upper = params.upperLimit || 0;
            const lower = params.lowerLimit || 0;
            
            if (upper <= lower) {
                errors.push('Upper limit must be higher than lower limit');
            }
            if (nominal < lower || nominal > upper) {
                errors.push('Nominal must be between the specified limits');
            }
            if (Math.abs(upper - nominal) !== Math.abs(nominal - lower)) {
                warnings.push('Tolerance limits are not symmetric about the nominal');
            }
        } else if (params.paramType === 'sigma') {
            if (params.sigma <= 0) {
                errors.push('Standard deviation must be positive');
            }
        } else if (params.paramType === 'cpk') {
            if (params.cpk <= 0) {
                errors.push('Cpk must be positive');
            }
        }
        
        return { isValid: errors.length === 0, errors, warnings };
    }

    static validateLognormal(nominal, params) {
        const errors = [];
        const warnings = [];
        
        const { mu, sigmaLog, gamma: gammaParam } = params;
        
        // Calculate theoretical mean of lognormal
        const theoreticalMean = gammaParam + Math.exp(mu + (sigmaLog * sigmaLog) / 2);
        const tolerance = 0.01 * nominal; // 1% tolerance
        
        if (Math.abs(theoreticalMean - nominal) > tolerance) {
            warnings.push(`Lognormal parameters produce a mean of ${theoreticalMean.toFixed(4)}, not ${nominal}. Consider adjusting μ.`);
        }
        
        if (sigmaLog <= 0) {
            errors.push('The log standard deviation must be positive');
        }
        
        if (gammaParam >= nominal) {
            warnings.push('The location parameter should be less than the nominal value');
        }
        
        return { isValid: errors.length === 0, errors, warnings };
    }

    static validateBeta(nominal, params) {
        const errors = [];
        const warnings = [];
        
        const { alpha, betaShape, A, B } = params;
        
        if (A >= B) {
            errors.push('The lower limit (A) must be less than the upper limit (B)');
        }
        
        if (nominal <= A || nominal >= B) {
            errors.push('The nominal value must be strictly between A and B');
        }
        
        if (alpha <= 0 || betaShape <= 0) {
            errors.push('The alpha and beta parameters must be positive');
        }
        
        // Validación adicional para parámetros muy pequeños
        if (alpha < 0.1 || betaShape < 0.1) {
            warnings.push('Very small alpha/beta values may lead to numerical instability');
        }
        
        // Calculate theoretical mean of Beta
        const theoreticalMean = A + (B - A) * (alpha / (alpha + betaShape));
        const tolerance = 0.02 * (B - A); // 2% of range
        
        if (Math.abs(theoreticalMean - nominal) > tolerance) {
            warnings.push(`The theoretical mean is ${theoreticalMean.toFixed(4)}. Consider adjusting parameters.`);
        }
        
        return { isValid: errors.length === 0, errors, warnings };
    }

    static validateExponential(nominal, params) {
        const errors = [];
        const warnings = [];
        
        const { lambda, gamma: gammaParam } = params;
        
        if (lambda <= 0) {
            errors.push('The rate (λ) must be positive');
        }
        
        // Theoretical mean of exponential
        const theoreticalMean = gammaParam + 1/lambda;
        const tolerance = 0.05 * nominal; // 5% tolerance
        
        if (Math.abs(theoreticalMean - nominal) > tolerance) {
            warnings.push(`The parameters produce a mean of ${theoreticalMean.toFixed(4)}. Consider adjusting λ.`);
        }
        
        if (gammaParam >= nominal) {
            warnings.push('The location parameter should be lower than the nominal value');
        }
        
        return { isValid: errors.length === 0, errors, warnings };
    }

    static validateWeibull(nominal, params) {
        const errors = [];
        const warnings = [];
        
        // CORRECCIÓN: Renombrar gamma a gammaParam para evitar conflicto
        const { beta, eta, gamma: gammaParam } = params;
        
        if (beta <= 0 || eta <= 0) {
            errors.push('The parameters beta and eta must be positive');
        }
        
        // Validar que gamma + eta > 0 para evitar valores no definidos
        if (gammaParam + eta <= 0) {
            errors.push('The sum of location (γ) and scale (η) parameters must be positive');
        }
        
        // Validar que el nominal esté dentro del rango esperado
        if (gammaParam >= nominal) {
            warnings.push('The location parameter should typically be less than the nominal value');
        }
        
        // CORRECCIÓN: Usar gammaParam y asegurar que la función gamma existe
        if (typeof gamma === 'function') {
            try {
                const theoreticalMean = gammaParam + eta * gamma(1 + 1/beta);
                const tolerance = 0.05 * nominal;
                
                if (Math.abs(theoreticalMean - nominal) > tolerance) {
                    warnings.push(`The theoretical mean is ${theoreticalMean.toFixed(4)}. Consider adjusting the parameters.`);
                }
            } catch (e) {
                warnings.push('Could not calculate theoretical mean for Weibull distribution');
            }
        }
        
        return { isValid: errors.length === 0, errors, warnings };
    }

    static validateTriangular(nominal, params) {
        const errors = [];
        const { A, B, C } = params;
        
        if (A >= B) {
            errors.push('A must be lower than B');
        }
        if (C < A || C > B) {
            errors.push('C must be between A and B');
        }
        if (nominal < A || nominal > B) {
            errors.push('The nominal value must be between A and B');
        }
        
        return { isValid: errors.length === 0, errors, warnings: [] };
    }

    static validateUniform(nominal, params) {
        const errors = [];
        const { A, B } = params;
        
        if (A >= B) {
            errors.push('A must be lower than B');
        }
        if (nominal < A || nominal > B) {
            errors.push('The nominal value must be between A and B');
        }
        
        return { isValid: errors.length === 0, errors, warnings: [] };
    }
}

// Real-time validation function
function validateDimensionInput(inputElement) {
    const container = inputElement.closest('.dimension-input');
    const nominal = parseFloat(container.querySelector('.dim-nominal').value);
    const distribution = container.querySelector('.dim-distribution').value;
    const params = getCurrentParams(container);
    
    const validation = DistributionValidator.validateDistribution(nominal, distribution, params);
    
    // Show errors/warnings
    const errorDiv = container.querySelector('.validation-feedback');
    if (!errorDiv) {
        const newErrorDiv = document.createElement('div');
        newErrorDiv.className = 'validation-feedback';
        container.appendChild(newErrorDiv);
    }
    
    if (!validation.isValid) {
        errorDiv.innerHTML = validation.errors.map(err => 
            `<div class="validation-error-message"><i class="fas fa-exclamation-circle"></i> ${err}</div>`
        ).join('');
        container.classList.add('validation-error');
        container.classList.remove('validation-warning');
    } else if (validation.warnings.length > 0) {
        errorDiv.innerHTML = validation.warnings.map(warn => 
            `<div class="validation-warning-message"><i class="fas fa-exclamation-triangle"></i> ${warn}</div>`
        ).join('');
        container.classList.add('validation-warning');
        container.classList.remove('validation-error');
    } else {
        errorDiv.innerHTML = '<div class="validation-success-message"><i class="fas fa-check-circle"></i> Valid parameters</div>';
        container.classList.remove('validation-error', 'validation-warning');
    }
    
    return validation.isValid;
}

// Get current parameters from form
function getCurrentParams(container) {
    const distribution = container.querySelector('.dim-distribution').value;
    const nominal = parseFloat(container.querySelector('.dim-nominal').value) || 0;
    const params = {};

    if (distribution === 'normal') {
        const paramType = container.querySelector('.normal-param-selector').value;
        params.paramType = paramType;

        if (paramType === 'tolerance') {
            const upperLimitInput = container.querySelector('.dim-tolerance-plus');
            const lowerLimitInput = container.querySelector('.dim-tolerance-minus');
            if (upperLimitInput && lowerLimitInput) {
                params.upperLimit = parseFloat(upperLimitInput.value) || 0;
                params.lowerLimit = parseFloat(lowerLimitInput.value) || 0;
            }
        } else if (paramType === 'sigma') {
            const sigmaInput = container.querySelector('.normal-param-sigma');
            if (sigmaInput) {
                params.sigma = parseFloat(sigmaInput.value) || 0;
            }
        } else if (paramType === 'cpk') {
            const cpkInput = container.querySelector('.normal-param-cpk');
            if (cpkInput) {
                params.cpk = parseFloat(cpkInput.value) || 0;
            }
        }
    } else {
        const dynamicDiv = container.querySelector('.normal-param-inputs-dynamic');
        if (dynamicDiv) {
            switch (distribution) {
                case 'homo':
                    params.A = parseFloat(dynamicDiv.querySelector('.dist-param-a').value) || 0;
                    params.B = parseFloat(dynamicDiv.querySelector('.dist-param-b').value) || 0;
                    break;
                case 'triangular':
                    params.A = parseFloat(dynamicDiv.querySelector('.dist-param-a').value) || 0;
                    params.B = parseFloat(dynamicDiv.querySelector('.dist-param-b').value) || 0;
                    params.C = parseFloat(dynamicDiv.querySelector('.dist-param-c').value) || 0;
                    break;
                case 'weibull':
                    params.beta = parseFloat(dynamicDiv.querySelector('.dist-param-beta').value) || 0;
                    params.eta = parseFloat(dynamicDiv.querySelector('.dist-param-eta').value) || 0;
                    params.gamma = parseFloat(dynamicDiv.querySelector('.dist-param-gamma').value) || 0;
                    break;
                case 'lognormal':
                    params.mu = parseFloat(dynamicDiv.querySelector('.dist-param-mu').value) || 0;
                    params.sigmaLog = parseFloat(dynamicDiv.querySelector('.dist-param-sigma-log').value) || 0;
                    params.gamma = parseFloat(dynamicDiv.querySelector('.dist-param-gamma').value) || 0;
                    break;
                case 'beta':
                    params.alpha = parseFloat(dynamicDiv.querySelector('.dist-param-alpha').value) || 0;
                    params.betaShape = parseFloat(dynamicDiv.querySelector('.dist-param-beta-shape').value) || 0;
                    params.A = parseFloat(dynamicDiv.querySelector('.dist-param-a').value) || 0;
                    params.B = parseFloat(dynamicDiv.querySelector('.dist-param-b').value) || 0;
                    break;
                case 'exponential':
                    params.lambda = parseFloat(dynamicDiv.querySelector('.dist-param-lambda').value) || 0;
                    params.gamma = parseFloat(dynamicDiv.querySelector('.dist-param-gamma').value) || 0;
                    break;
            }
        }
    }

    return params;
}

// Validation before calculation
function validateAllDimensions() {
    const dimensions = document.querySelectorAll('.dimension-input');
    let allValid = true;
    
    dimensions.forEach(dim => {
        const isValid = validateDimensionInput(dim.querySelector('.dim-nominal'));
        if (!isValid) allValid = false;
    });
    
    return allValid;
}

// --- Distribution Sampling Functions ---
function boxMullerTransform() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); 
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
function getRandomNormal(mean, stddev) {
    return mean + stddev * boxMullerTransform();
}
function getRandomUniform(a, b) {
    return a + Math.random() * (b - a);
}
function getRandomTriangular(a, b, c) {
    const r = Math.random();
    const fc = (c - a) / (b - a);
    if (r < fc) {
        return a + Math.sqrt(r * (b - a) * (c - a));
    } else {
        return b - Math.sqrt((1 - r) * (b - a) * (b - c));
    }
}
function getRandomWeibull(beta, eta) {
    if (beta <= 0 || eta <= 0) return 0;
    return eta * Math.pow(-Math.log(1 - Math.random()), 1 / beta);
}
function getRandomLognormal(mu, sigma) {
    const normal = boxMullerTransform();
    return Math.exp(mu + sigma * normal);
}
function getRandomBeta(alpha, beta, a, b) {
    if (alpha <= 0 || beta <= 0) return (a + b) / 2;
    
    let maxPdf = 1;
    if (alpha > 1 && beta > 1) {
        const mode = (alpha - 1) / (alpha + beta - 2);
        maxPdf = Math.pow(mode, alpha - 1) * Math.pow(1 - mode, beta - 1);
    } else {
        maxPdf = 3;
    }
    
    while (true) {
        const x = Math.random();
        const y = Math.random() * maxPdf;
        const pdf = Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1);
        if (y <= pdf) {
            return a + x * (b - a);
        }
    }
}
function getRandomExponential(lambda) {
    if (lambda <= 0) return 0;
    return -Math.log(1 - Math.random()) / lambda;
}

function validateInput(input) {
    const container = input.closest('.dimension-input');
    const errorMessage = container.querySelector('.error-message');
    
    input.classList.remove('error');
    container.classList.remove('error');
    if (errorMessage) errorMessage.classList.remove('show');
    
    if (input.classList.contains('dim-nominal')) {
        const value = parseFloat(input.value);
        if (isNaN(value) || value < 0) {
            input.classList.add('error');
            container.classList.add('error');
            if (errorMessage) {
                errorMessage.textContent = 'The nominal must be a positive number';
                errorMessage.classList.add('show');
            }
            return false;
        }
    }
    
    if (input.classList.contains('normal-param-input')) {
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            input.classList.add('error');
            container.classList.add('error');
            if (errorMessage) {
                errorMessage.textContent = 'This parameter must be a valid number';
                errorMessage.classList.add('show');
            }
            return false;
        }
        
        if (input.classList.contains('dist-param-a') || input.classList.contains('dist-param-b')) {
            const a = container.querySelector('.dist-param-a');
            const b = container.querySelector('.dist-param-b');
            if (a && b && parseFloat(a.value) >= parseFloat(b.value)) {
                a.classList.add('error');
                b.classList.add('error');
                container.classList.add('error');
                if (errorMessage) {
                    errorMessage.textContent = 'The minimum value (A) must be lower than the maximum (B)';
                    errorMessage.classList.add('show');
                }
                return false;
            }
        }
        
        if (input.classList.contains('dist-param-beta') || input.classList.contains('dist-param-eta') || 
            input.classList.contains('dist-param-lambda') || input.classList.contains('dist-param-alpha') ||
            input.classList.contains('dist-param-beta-shape')) {
            if (value <= 0) {
                input.classList.add('error');
                container.classList.add('error');
                if (errorMessage) {
                    errorMessage.textContent = 'This parameter must be greater than zero';
                    errorMessage.classList.add('show');
                }
                return false;
            }
        }
    }
    
    // Intelligent distribution validation
    validateDimensionInput(input);
    
    return true;
}

function handleNormalParamChange(selectElement) {
    const inputContainer = selectElement.closest('.dimension-input');
    const dynamicInputDiv = inputContainer.querySelector('.normal-param-inputs-dynamic');
    const paramType = selectElement.value;
    dynamicInputDiv.innerHTML = '';
    
    const lastTolPlus = parseFloat(inputContainer.dataset.lastTolPlus) || 0.1;
    const lastTolMinus = parseFloat(inputContainer.dataset.lastTolMinus) || 0.1;
    const lastSigma = parseFloat(inputContainer.dataset.lastSigma) || 0.033;
    const lastCpk = parseFloat(inputContainer.dataset.lastCpk) || 1.33;
    
    if (paramType === 'tolerance') {
         dynamicInputDiv.innerHTML = `
            <label>Upper Limit:</label>
            <input type="number" class="dim-tolerance-plus normal-param-input" value="${(parseFloat(inputContainer.querySelector('.dim-nominal').value) + lastTolPlus).toFixed(4)}" step="0.001" 
                   oninput="this.closest('.dimension-input').dataset.lastTolPlus = (this.value - parseFloat(this.closest('.dimension-input').querySelector('.dim-nominal').value)).toFixed(4); updateVisualization(); validateInput(this)">
            <label>Lower Limit:</label>
            <input type="number" class="dim-tolerance-minus normal-param-input" value="${(parseFloat(inputContainer.querySelector('.dim-nominal').value) - lastTolMinus).toFixed(4)}" step="0.001" 
                   oninput="this.closest('.dimension-input').dataset.lastTolMinus = (parseFloat(this.closest('.dimension-input').querySelector('.dim-nominal').value) - this.value).toFixed(4); updateVisualization(); validateInput(this)">
        `;
    } else if (paramType === 'sigma') {
        dynamicInputDiv.innerHTML = `
            <label>Std Dev (σ):</label>
            <input type="number" class="normal-param-sigma normal-param-input" value="${lastSigma.toFixed(4)}" step="0.001" min="0.0001" title="Standard Deviation (sigma)"
                   oninput="this.closest('.dimension-input').dataset.lastSigma = this.value; updateVisualization(); validateInput(this)">
        `;
    } else if (paramType === 'cpk') {
        const cpkValues = [1.00, 1.33, 1.67, 2.00];
        let optionsHTML = cpkValues.map(val => 
            `<option value="${val.toFixed(2)}" ${parseFloat(val.toFixed(2)) === parseFloat(lastCpk.toFixed(2)) ? 'selected' : ''}>${val}</option>`
        ).join('');
        
        dynamicInputDiv.innerHTML = `
            <label>Cpk:</label>
            <select class="normal-param-cpk normal-param-input" title="Process Capability Index (Cpk)" 
                    onchange="this.closest('.dimension-input').dataset.lastCpk = this.value; updateVisualization(); validateInput(this)">
                ${optionsHTML}
            </select>
            <p style="margin: 0; font-size: 0.8rem; color: #777;">σ will be derived from Cpk and the tighter tolerance limit.</p>
        `;
    }
    updateVisualization();
    validateInput(selectElement);
}

function updateDistributionInputs(selectElement, nominal = 0, tolerance = {plus: 0.01, minus: 0.01}, normalParamType = 'tolerance', normalParamValue = 0) {
    const inputContainer = selectElement.closest('.dimension-input');
    const paramsDiv = inputContainer.querySelector('.distribution-params');
    const dynamicInputDiv = inputContainer.querySelector('.normal-param-inputs-dynamic');
    const dist = selectElement.value;
    
    const nominalVal = parseFloat(inputContainer.querySelector('.dim-nominal').value) || 0;
    
    const initialTolPlus = inputContainer.dataset.lastTolPlus = inputContainer.dataset.lastTolPlus || tolerance.plus.toFixed(4);
    const initialTolMinus = inputContainer.dataset.lastTolMinus = inputContainer.dataset.lastTolMinus || tolerance.minus.toFixed(4);
    const defaultSigma = Math.max(parseFloat(initialTolPlus), parseFloat(initialTolMinus)) / 3;
    const sigmaInitValue = normalParamType === 'sigma' && normalParamValue > 0 ? normalParamValue : defaultSigma;
    const initialSigma = inputContainer.dataset.lastSigma = inputContainer.dataset.lastSigma || sigmaInitValue.toFixed(4);
    const cpkInitValue = normalParamType === 'cpk' && normalParamValue > 0 ? normalParamValue : 1.33;
    const initialCpk = inputContainer.dataset.lastCpk = inputContainer.dataset.lastCpk || cpkInitValue.toFixed(2);

    const minVal = nominalVal - parseFloat(initialTolMinus);
    const maxVal = nominalVal + parseFloat(initialTolPlus);
    const avgTol = (parseFloat(initialTolPlus) + parseFloat(initialTolMinus)) / 2;
    
    dynamicInputDiv.innerHTML = '';
    paramsDiv.style.display = 'flex';

    if (dist === 'normal') {
        paramsDiv.querySelector('.normal-param-selector').style.display = 'inline-block';
        paramsDiv.querySelector('label[for]').style.display = 'inline-block';
        
        let initialParamsHTML;
        let initialSelectorValue = normalParamType;

        if (normalParamType === 'sigma') {
            initialParamsHTML = `
                <label>Std Dev (σ):</label>
                <input type="number" class="normal-param-sigma normal-param-input" value="${parseFloat(initialSigma).toFixed(4)}" step="0.001" min="0.0001" title="Standard Deviation (sigma)"
                       oninput="this.closest('.dimension-input').dataset.lastSigma = this.value; updateVisualization(); validateInput(this)">
            `;
        } else if (normalParamType === 'cpk') {
            const cpkValues = [1.00, 1.33, 1.67, 2.00];
            let optionsHTML = cpkValues.map(val => 
                `<option value="${val.toFixed(2)}" ${parseFloat(val.toFixed(2)) === parseFloat(initialCpk) ? 'selected' : ''}>${val}</option>`
            ).join('');

             initialParamsHTML = `
                <label>Cpk:</label>
                <select class="normal-param-cpk normal-param-input" title="Process Capability Index (Cpk)" 
                        onchange="this.closest('.dimension-input').dataset.lastCpk = this.value; updateVisualization(); validateInput(this)">
                    ${optionsHTML}
                </select>
                <p style="margin: 0; font-size: 0.8rem; color: #777;">σ will be derived from Cpk and the tighter tolerance limit.</p>
            `;
        } else {
            initialSelectorValue = 'tolerance';
            initialParamsHTML = `
                <label>Upper Limit:</label>
                <input type="number" class="dim-tolerance-plus normal-param-input" value="${(nominalVal + parseFloat(initialTolPlus)).toFixed(4)}" step="0.001" 
                       oninput="this.closest('.dimension-input').dataset.lastTolPlus = (this.value - parseFloat(this.closest('.dimension-input').querySelector('.dim-nominal').value)).toFixed(4); updateVisualization(); validateInput(this)">
                <label>Lower Limit:</label>
                <input type="number" class="dim-tolerance-minus normal-param-input" value="${(nominalVal - parseFloat(initialTolMinus)).toFixed(4)}" step="0.001" 
                       oninput="this.closest('.dimension-input').dataset.lastTolMinus = (parseFloat(this.closest('.dimension-input').querySelector('.dim-nominal').value) - this.value).toFixed(4); updateVisualization(); validateInput(this)">
            `;
        }
        
        paramsDiv.querySelector('.normal-param-selector').value = initialSelectorValue;
        dynamicInputDiv.innerHTML = initialParamsHTML;

    } else if (dist === 'homo') {
        paramsDiv.querySelector('.normal-param-selector').style.display = 'none';
        paramsDiv.querySelector('label[for]').style.display = 'none';
        
        dynamicInputDiv.innerHTML = `
            <label>Min (A):</label>
            <input type="number" class="dist-param-a normal-param-input" value="${minVal.toFixed(4)}" step="any" title="Minimum value (A)"
                   oninput="validateInput(this)">
            <label>Max (B):</label>
            <input type="number" class="dist-param-b normal-param-input" value="${maxVal.toFixed(4)}" step="any" title="Maximum value (B)"
                   oninput="validateInput(this)">
        `;
    } else if (dist === 'triangular') {
        paramsDiv.querySelector('.normal-param-selector').style.display = 'none';
        paramsDiv.querySelector('label[for]').style.display = 'none';
        const mode = nominalVal;
        dynamicInputDiv.innerHTML = `
            <label>Min (A):</label>
            <input type="number" class="dist-param-a normal-param-input" value="${minVal.toFixed(4)}" step="any" title="Minimum value (A)"
                   oninput="validateInput(this)">
            <label>Mode (C):</label>
            <input type="number" class="dist-param-c normal-param-input" value="${mode.toFixed(4)}" step="any" title="Most likely value (C)"
                   oninput="validateInput(this)">
            <label>Max (B):</label>
            <input type="number" class="dist-param-b normal-param-input" value="${maxVal.toFixed(4)}" step="any" title="Maximum value (B)"
                   oninput="validateInput(this)">
        `;
    } else if (dist === 'weibull') {
        paramsDiv.querySelector('.normal-param-selector').style.display = 'none';
        paramsDiv.querySelector('label[for]').style.display = 'none';
        
        const beta = 3.5;
        const eta = avgTol / 3;
        const gammaVal = minVal;
        
        dynamicInputDiv.innerHTML = `
            <label>Shape (β):</label>
            <input type="number" class="dist-param-beta normal-param-input" value="${beta.toFixed(2)}" step="0.1" min="0.1" title="Shape parameter (beta)"
                   oninput="validateInput(this)">
            <label>Scale (η):</label>
            <input type="number" class="dist-param-eta normal-param-input" value="${eta.toFixed(4)}" step="any" min="0.001" title="Scale parameter (eta)"
                   oninput="validateInput(this)">
            <label>Location (γ):</label>
            <input type="number" class="dist-param-gamma normal-param-input" value="${gammaVal.toFixed(4)}" step="any" title="Location parameter (gamma)"
                   oninput="validateInput(this)">
        `;
    } else if (dist === 'lognormal') {
        paramsDiv.querySelector('.normal-param-selector').style.display = 'none';
        paramsDiv.querySelector('label[for]').style.display = 'none';
        
        const mu = Math.log(nominalVal > 0 ? nominalVal : 1);
        const sigmaLog = 0.1;
        const gammaVal = minVal * 0.9;
        
        dynamicInputDiv.innerHTML = `
            <label>μ (log mean):</label>
            <input type="number" class="dist-param-mu normal-param-input" value="${mu.toFixed(4)}" step="any" title="Mu parameter (log of median)"
                   oninput="validateInput(this)">
            <label>σ (log std):</label>
            <input type="number" class="dist-param-sigma-log normal-param-input" value="${sigmaLog.toFixed(4)}" step="0.01" min="0.001" title="Sigma parameter (log of std dev)"
                   oninput="validateInput(this)">
            <label>Location (γ):</label>
            <input type="number" class="dist-param-gamma normal-param-input" value="${gammaVal.toFixed(4)}" step="any" title="Location parameter (gamma)"
                   oninput="validateInput(this)">
        `;
    } else if (dist === 'beta') {
        paramsDiv.querySelector('.normal-param-selector').style.display = 'none';
        paramsDiv.querySelector('label[for]').style.display = 'none';
        const alpha = 2;
        const beta = 2;
        
        dynamicInputDiv.innerHTML = `
            <label>α (alpha):</label>
            <input type="number" class="dist-param-alpha normal-param-input" value="${alpha.toFixed(2)}" step="0.1" min="0.1" title="Alpha shape parameter"
                   oninput="validateInput(this)">
            <label>β (beta):</label>
            <input type="number" class="dist-param-beta-shape normal-param-input" value="${beta.toFixed(2)}" step="0.1" min="0.1" title="Beta shape parameter"
                   oninput="validateInput(this)">
            <label>Min (a):</label>
            <input type="number" class="dist-param-a normal-param-input" value="${minVal.toFixed(4)}" step="any" title="Minimum bound"
                   oninput="validateInput(this)">
            <label>Max (b):</label>
            <input type="number" class="dist-param-b normal-param-input" value="${maxVal.toFixed(4)}" step="any" title="Maximum bound"
                   oninput="validateInput(this)">
        `;
    } else if (dist === 'exponential') {
        paramsDiv.querySelector('.normal-param-selector').style.display = 'none';
        paramsDiv.querySelector('label[for]').style.display = 'none';
        
        const lambda = 1 / avgTol;
        const gammaVal = minVal;
        
        dynamicInputDiv.innerHTML = `
            <label>λ (rate):</label>
            <input type="number" class="dist-param-lambda normal-param-input" value="${lambda.toFixed(4)}" step="any" min="0.001" title="Lambda rate parameter"
                   oninput="validateInput(this)">
            <label>Location (γ):</label>
            <input type="number" class="dist-param-gamma normal-param-input" value="${gammaVal.toFixed(4)}" step="any" title="Location parameter (gamma)"
                   oninput="validateInput(this)">
        `;
    }
    
    // Validate after updating
    setTimeout(() => {
        validateInput(selectElement);
    }, 0);
}

// CORREGIDA: Función getDimensionData mejorada para leer valores actuales
function getDimensionData() {
    const dimensionElements = document.querySelectorAll('#dimensions-container > .dimension-input');
    const dimensions = [];
    let allNormal = true;

    dimensionElements.forEach((el, index) => {
        const distribution = el.querySelector('.dim-distribution').value;
        const nominal = parseFloat(el.querySelector('.dim-nominal').value) || 0;
        const name = el.querySelector('.dim-name').value || `Dim ${index + 1}`;
        const sign = el.querySelector('.sign-btn.active').dataset.sign === '-' ? -1 : 1;
        
        let tolerancePlus = 0, toleranceMinus = 0, stddev = 0;
        const additionalParams = {};

        if (distribution === 'normal') {
            const paramSelector = el.querySelector('.normal-param-selector');
            const paramType = paramSelector ? paramSelector.value : 'tolerance';
            
            if (paramType === 'tolerance') {
                const upperLimitInput = el.querySelector('.dim-tolerance-plus');
                const lowerLimitInput = el.querySelector('.dim-tolerance-minus');
                if (upperLimitInput && lowerLimitInput) {
                    const upperLimit = parseFloat(upperLimitInput.value) || 0;
                    const lowerLimit = parseFloat(lowerLimitInput.value) || 0;
                    tolerancePlus = Math.max(0, upperLimit - nominal);
                    toleranceMinus = Math.max(0, nominal - lowerLimit);
                    stddev = (tolerancePlus + toleranceMinus) / 6;
                }
            } else if (paramType === 'sigma') {
                const sigmaInput = el.querySelector('.normal-param-sigma');
                stddev = parseFloat(sigmaInput.value) || 0;
                tolerancePlus = 3 * stddev;
                toleranceMinus = 3 * stddev;
            } else if (paramType === 'cpk') {
                const cpkInput = el.querySelector('.normal-param-cpk');
                const cpk = parseFloat(cpkInput.value) || 1.33;
                // Para cpk, necesitamos límites de tolerancia
                const upperLimitInput = el.querySelector('.dim-tolerance-plus');
                const lowerLimitInput = el.querySelector('.dim-tolerance-minus');
                if (upperLimitInput && lowerLimitInput) {
                    const upperLimit = parseFloat(upperLimitInput.value) || 0;
                    const lowerLimit = parseFloat(lowerLimitInput.value) || 0;
                    tolerancePlus = Math.max(0, upperLimit - nominal);
                    toleranceMinus = Math.max(0, nominal - lowerLimit);
                    const minTol = Math.min(tolerancePlus, toleranceMinus);
                    stddev = minTol > 0 ? minTol / (3 * Math.abs(cpk)) : 0;
                }
            }
            additionalParams.paramType = paramType;
            
        } else {
            allNormal = false;
            const dynamicDiv = el.querySelector('.normal-param-inputs-dynamic');
            
            if (distribution === 'homo') {
                additionalParams.A = parseFloat(dynamicDiv.querySelector('.dist-param-a').value) || 0;
                additionalParams.B = parseFloat(dynamicDiv.querySelector('.dist-param-b').value) || 0;
                stddev = Math.abs(additionalParams.B - additionalParams.A) / Math.sqrt(12);
                tolerancePlus = additionalParams.B - nominal;
                toleranceMinus = nominal - additionalParams.A;
                
            } else if (distribution === 'triangular') {
                additionalParams.A = parseFloat(dynamicDiv.querySelector('.dist-param-a').value) || 0;
                additionalParams.B = parseFloat(dynamicDiv.querySelector('.dist-param-b').value) || 0;
                additionalParams.C = parseFloat(dynamicDiv.querySelector('.dist-param-c').value) || 0;
                stddev = Math.sqrt((additionalParams.A**2 + additionalParams.B**2 + additionalParams.C**2 - 
                                   additionalParams.A*additionalParams.B - additionalParams.A*additionalParams.C - 
                                   additionalParams.B*additionalParams.C) / 18);
                tolerancePlus = additionalParams.B - nominal;
                toleranceMinus = nominal - additionalParams.A;
                
            } else if (distribution === 'weibull') {
                additionalParams.beta = parseFloat(dynamicDiv.querySelector('.dist-param-beta').value) || 1;
                additionalParams.eta = parseFloat(dynamicDiv.querySelector('.dist-param-eta').value) || 1;
                additionalParams.gamma = parseFloat(dynamicDiv.querySelector('.dist-param-gamma').value) || 0;
                
                // CORRECCIÓN: Manejar casos edge en Weibull
                if (additionalParams.beta > 0 && additionalParams.eta > 0) {
                    try {
                        const term1 = gamma(1 + 2/additionalParams.beta);
                        const term2 = Math.pow(gamma(1 + 1/additionalParams.beta), 2);
                        const variance = Math.pow(additionalParams.eta, 2) * (term1 - term2);
                        stddev = Math.sqrt(Math.max(0, variance));
                    } catch (e) {
                        stddev = additionalParams.eta; // Fallback
                    }
                }
                tolerancePlus = 3 * stddev; // Aproximación
                toleranceMinus = 3 * stddev;
                
            } else if (distribution === 'lognormal') {
                additionalParams.mu = parseFloat(dynamicDiv.querySelector('.dist-param-mu').value) || 0;
                additionalParams.sigmaLog = parseFloat(dynamicDiv.querySelector('.dist-param-sigma-log').value) || 0.1;
                additionalParams.gamma = parseFloat(dynamicDiv.querySelector('.dist-param-gamma').value) || 0;
                
                try {
                    const variance = (Math.exp(Math.pow(additionalParams.sigmaLog, 2)) - 1) * 
                                     Math.exp(2 * additionalParams.mu + Math.pow(additionalParams.sigmaLog, 2));
                    stddev = Math.sqrt(Math.max(0, variance));
                } catch (e) {
                    stddev = 1; // Fallback
                }
                tolerancePlus = 3 * stddev;
                toleranceMinus = 3 * stddev;
                
            } else if (distribution === 'beta') {
                additionalParams.alpha = parseFloat(dynamicDiv.querySelector('.dist-param-alpha').value) || 2;
                additionalParams.betaShape = parseFloat(dynamicDiv.querySelector('.dist-param-beta-shape').value) || 2;
                additionalParams.A = parseFloat(dynamicDiv.querySelector('.dist-param-a').value) || 0;
                additionalParams.B = parseFloat(dynamicDiv.querySelector('.dist-param-b').value) || 1;
                
                const range = additionalParams.B - additionalParams.A;
                const alphaBetaSum = additionalParams.alpha + additionalParams.betaShape;
                if (alphaBetaSum > 0 && additionalParams.alpha > 0 && additionalParams.betaShape > 0) {
                    stddev = range * Math.sqrt(additionalParams.alpha * additionalParams.betaShape / 
                                              (Math.pow(alphaBetaSum, 2) * (alphaBetaSum + 1)));
                }
                tolerancePlus = additionalParams.B - nominal;
                toleranceMinus = nominal - additionalParams.A;
                
            } else if (distribution === 'exponential') {
                additionalParams.lambda = parseFloat(dynamicDiv.querySelector('.dist-param-lambda').value) || 1;
                additionalParams.gamma = parseFloat(dynamicDiv.querySelector('.dist-param-gamma').value) || 0;
                
                stddev = additionalParams.lambda > 0 ? 1 / additionalParams.lambda : 1;
                tolerancePlus = 3 * stddev;
                toleranceMinus = 3 * stddev;
            }
        }

        dimensions.push({
            name: name,
            nominal: nominal,
            tolerancePlus: Math.max(0, tolerancePlus),
            toleranceMinus: Math.max(0, toleranceMinus),
            stddev: Math.max(0, stddev),
            distribution: distribution,
            additionalParams: additionalParams,
            sign: sign
        });
    });

    return { dimensions, allNormal };
}

// CORREGIDA: Función calculateMonteCarlo más robusta
function calculateMonteCarlo(dimensions, sampleSize) {
    console.log("Starting Monte Carlo simulation...");
    let samples = [];
    let validSamples = 0;
    const maxAttempts = sampleSize * 3; // Aumentar límite de intentos
    
    for (let i = 0; i < sampleSize && validSamples < maxAttempts; i++) {
        let stack = 0;
        let isValid = true;
        
        dimensions.forEach(dim => {
            let sample;
            try {
                const mean = dim.nominal;
                
                if (dim.distribution === 'normal') {
                    sample = getRandomNormal(mean, dim.stddev);
                } else if (dim.distribution === 'homo') {
                    sample = getRandomUniform(dim.additionalParams.A, dim.additionalParams.B);
                } else if (dim.distribution === 'triangular') {
                    sample = getRandomTriangular(dim.additionalParams.A, dim.additionalParams.B, dim.additionalParams.C);
                } else if (dim.distribution === 'weibull') {
                     sample = dim.additionalParams.gamma + getRandomWeibull(dim.additionalParams.beta, dim.additionalParams.eta);
                } else if (dim.distribution === 'lognormal') {
                    sample = dim.additionalParams.gamma + getRandomLognormal(dim.additionalParams.mu, dim.additionalParams.sigmaLog);
                } else if (dim.distribution === 'beta') {
                    sample = getRandomBeta(dim.additionalParams.alpha, dim.additionalParams.betaShape, dim.additionalParams.A, dim.additionalParams.B);
                } else if (dim.distribution === 'exponential') {
                    sample = dim.additionalParams.gamma + getRandomExponential(dim.additionalParams.lambda);
                } else {
                    sample = mean;
                }
                
                // Verificar que el sample es finito y dentro de límites razonables
                if (!isFinite(sample) || Math.abs(sample) > 1e10) {
                    isValid = false;
                    console.warn(`Invalid sample generated for dimension ${dim.name}: ${sample}`);
                }
            } catch (error) {
                console.error(`Error generating sample for dimension ${dim.name}:`, error);
                isValid = false;
            }
            
            if (isValid) {
                stack += sample * dim.sign;
            }
        });
        
        if (isValid && isFinite(stack) && Math.abs(stack) < 1e10) {
            samples.push(stack);
            validSamples++;
        }
    }
    
    if (samples.length === 0) {
        console.error("No valid samples generated in Monte Carlo simulation");
        return {
            nominal: 0,
            stddev: 0,
            tolerance: 0,
            min: 0,
            max: 0,
            samples: []
        };
    }
    
    console.log(`Monte Carlo simulation completed: ${samples.length} valid samples`);
    
    const sum = samples.reduce((acc, val) => acc + val, 0);
    const nominalSum = sum / samples.length;
    const sumSqDev = samples.reduce((sum, val) => sum + (val - nominalSum) ** 2, 0);
    const stddev = Math.sqrt(sumSqDev / (samples.length - 1));
    const tolerance = 3 * stddev;

    return {
        nominal: nominalSum,
        stddev: stddev,
        tolerance: tolerance,
        min: Math.min(...samples),
        max: Math.max(...samples),
        samples: samples
    };
}

// CORREGIDA: Función calculate con validación mejorada
function calculate() {
    console.log("Starting tolerance calculation...");
    
    // Validar todas las dimensiones antes de calcular
    if (!validateAllDimensions()) {
        console.error("Validation failed - aborting calculation");
        alert('Please correct the errors in the distribution parameters before calculating.');
        return;
    }
    
    try {
        const { dimensions, allNormal } = getDimensionData();
        const sampleSize = parseInt(document.getElementById('sampleSize').value) || 10000;
        
        console.log(`Processing ${dimensions.length} dimensions, allNormal: ${allNormal}`);
        
        if (dimensions.length === 0) {
            alert('Please add at least one dimension.');
            return;
        }

        // Verificar que todos los valores sean finitos
        const hasInvalidValues = dimensions.some(dim => 
            !isFinite(dim.nominal) || 
            !isFinite(dim.tolerancePlus) || 
            !isFinite(dim.toleranceMinus) ||
            !isFinite(dim.stddev)
        );
        
        if (hasInvalidValues) {
            alert('Invalid numerical values detected. Please check your inputs.');
            return;
        }

        // Cálculos aritméticos
        const nominalSum = dimensions.reduce((sum, dim) => sum + (dim.nominal * dim.sign), 0);
        const toleranceSumPlus = dimensions.reduce((sum, dim) => sum + Math.abs(dim.tolerancePlus), 0);
        const toleranceSumMinus = dimensions.reduce((sum, dim) => sum + Math.abs(dim.toleranceMinus), 0);
        
        document.getElementById('arithmetic-nominal').textContent = nominalSum.toFixed(4);
        document.getElementById('arithmetic-tolerance').textContent = `+${toleranceSumPlus.toFixed(4)} / -${toleranceSumMinus.toFixed(4)}`;
        document.getElementById('arithmetic-max').textContent = (nominalSum + toleranceSumPlus).toFixed(4);
        document.getElementById('arithmetic-min').textContent = (nominalSum - toleranceSumMinus).toFixed(4);

        const monteCarloResults = calculateMonteCarlo(dimensions, sampleSize);
        let probabilisticResults;
        let methodLabel = "RSS";
        let isMonteCarloRequired = !allNormal;

        if (allNormal) {
            const stddevRSS = Math.sqrt(dimensions.reduce((sum, dim) => sum + Math.pow(dim.stddev, 2), 0));
            const toleranceRSS = 3 * stddevRSS; 

            probabilisticResults = {
                nominal: nominalSum,
                stddev: stddevRSS,
                tolerance: toleranceRSS,
                max: (nominalSum + toleranceRSS),
                min: (nominalSum - toleranceRSS)
            };
            methodLabel = "RSS (Formula)";
            console.log("Using RSS method for all-normal distributions");
            
            document.getElementById('rss-results').style.display = 'block';
            document.getElementById('montecarlo-results').style.display = 'none';
            
        } else {
            probabilisticResults = {
                nominal: monteCarloResults.nominal,
                stddev: monteCarloResults.stddev,
                tolerance: monteCarloResults.tolerance,
                max: monteCarloResults.max,
                min: monteCarloResults.min
            };
            methodLabel = "Monte Carlo (Mixed)";
            console.log("Using Monte Carlo method for mixed distributions");
            
            document.getElementById('rss-results').style.display = 'none';
            document.getElementById('montecarlo-results').style.display = 'flex';
        }
        
        document.getElementById('probabilistic-nominal').textContent = probabilisticResults.nominal.toFixed(4);
        document.getElementById('probabilistic-stddev').textContent = probabilisticResults.stddev.toFixed(4);
        document.getElementById('probabilistic-tolerance').textContent = `±${probabilisticResults.tolerance.toFixed(4)} (3σ)`;
        document.getElementById('probabilistic-max').textContent = probabilisticResults.max.toFixed(4);
        document.getElementById('probabilistic-min').textContent = probabilisticResults.min.toFixed(4);
        document.querySelector('.result-method:nth-child(2) h4').innerHTML = `<i class="fas fa-chart-bar"></i> Probabilistic Method (${methodLabel})`;

        document.getElementById('montecarlo-nominal').textContent = monteCarloResults.nominal.toFixed(4);
        document.getElementById('montecarlo-stddev').textContent = monteCarloResults.stddev.toFixed(4);
        document.getElementById('montecarlo-tolerance').textContent = `±${monteCarloResults.tolerance.toFixed(4)} (3σ)`;
        document.getElementById('montecarlo-max').textContent = monteCarloResults.max.toFixed(4);
        document.getElementById('montecarlo-min').textContent = monteCarloResults.min.toFixed(4);

        updateChart(monteCarloResults.samples, isMonteCarloRequired ? 'Monte Carlo Distribution' : 'Simulated Normal Distribution');

        calculationCount++;
        calculationHistory.unshift({
            id: calculationCount,
            dimensions: dimensions,
            arithmetic: { nominal: nominalSum, tolerancePlus: toleranceSumPlus, toleranceMinus: toleranceSumMinus, max: nominalSum + toleranceSumPlus, min: nominalSum - toleranceSumMinus },
            probabilistic: probabilisticResults,
            monteCarlo: monteCarloResults,
            method: isMonteCarloRequired ? 'Monte Carlo' : 'RSS'
        });

        console.log("Tolerance calculation completed successfully");
        document.getElementById('resultsTab').click();
        document.getElementById('results-history').style.display = 'none';
        
        setTimeout(() => {
            document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
    } catch (error) {
        console.error("Error during calculation:", error);
        alert('An error occurred during calculation. Please check your inputs and try again.');
    }
}

function updateChart(samples, title) {
    if (chart) {
        chart.destroy();
    }

    const ctx = document.getElementById('distributionChart').getContext('2d');
    
    const numBins = 50;
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    const range = max - min;
    const binSize = range / numBins;
    
    const bins = new Array(numBins).fill(0);
    const labels = new Array(numBins).fill(0).map((_, i) => (min + (i * binSize)).toFixed(4));
    
    samples.forEach(sample => {
        let binIndex = Math.floor((sample - min) / binSize);
        if (binIndex === numBins) binIndex = numBins - 1;
        if (binIndex >= 0 && binIndex < numBins) {
            bins[binIndex]++;
        }
    });
    
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency',
                data: bins,
                backgroundColor: 'rgba(52, 152, 219, 0.8)',
                borderColor: 'rgba(44, 62, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: title,
                    font: { size: 14 }
                },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const index = items[0].dataIndex;
                            const minBin = parseFloat(labels[index]);
                            const maxBin = minBin + binSize;
                            return `Range: ${minBin.toFixed(4)} to ${maxBin.toFixed(4)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Assembly key characteristics (KC)'
                    },
                    ticks: {
                        autoSkip: true,
                        maxRotation: 45,
                        minRotation: 0,
                        callback: function(value, index, values) {
                            return (index % 5 === 0) ? labels[index] : '';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Count'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// CORREGIDA: Función addDimension con parámetros más estables
function addDimension(name = '', nominal = 10, tolerance = {plus: 0.1, minus: 0.1}, distribution = 'normal', normalParams = {paramType: 'tolerance', sigma: 0, cpk: 0}, sign = '+', specificParams = {}) {
    const container = document.getElementById('dimensions-container');
    
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const div = document.createElement('div');
    div.className = 'dimension-input';
    
    div.dataset.lastTolPlus = tolerance.plus.toFixed(4);
    div.dataset.lastTolMinus = tolerance.minus.toFixed(4);
    
    const defaultSigma = Math.max(tolerance.plus, tolerance.minus) / 3;
    div.dataset.lastSigma = (normalParams.sigma > 0 ? normalParams.sigma : defaultSigma).toFixed(4);
    div.dataset.lastCpk = (normalParams.cpk > 0 ? normalParams.cpk : 1.33).toFixed(2);

    div.innerHTML = `
        <div class="sign-selector">
            <div class="sign-btn ${sign === '+' ? 'active' : ''}" data-sign="+" onclick="toggleSign(this)">+</div>
            <div class="sign-btn ${sign === '-' ? 'active' : ''}" data-sign="-" onclick="toggleSign(this)">-</div>
        </div>
        <label>Dimension:</label>
        <input type="text" class="dim-name" value="${name || String.fromCharCode(65 + dimensionCount)}" placeholder="Name">
        <label>Nominal value:</label>
        <input type="number" class="dim-nominal" value="${nominal.toFixed(4)}" step="any" min="0" oninput="updateVisualization(); validateInput(this)">
        <label>Distribution:</label>
        <select class="dim-distribution" onchange="updateDistributionInputs(this); updateVisualization()">
            <option value="normal" ${distribution === 'normal' ? 'selected' : ''}>Normal</option>
            <option value="homo" ${distribution === 'homo' ? 'selected' : ''}>Homogeneous</option>
            <option value="triangular" ${distribution === 'triangular' ? 'selected' : ''}>Triangular</option>
            <option value="weibull" ${distribution === 'weibull' ? 'selected' : ''}>Weibull</option>
            <option value="lognormal" ${distribution === 'lognormal' ? 'selected' : ''}>Lognormal</option>
            <option value="beta" ${distribution === 'beta' ? 'selected' : ''}>Beta</option>
            <option value="exponential" ${distribution === 'exponential' ? 'selected' : ''}>Exponential</option>
        </select>
        <div class="distribution-params">
            <label for="normal-param-selector-id">Define by:</label>
            <select class="normal-param-selector" id="normal-param-selector-id" onchange="handleNormalParamChange(this)">
                <option value="tolerance">Upper/Lower Limits</option>
                <option value="sigma">Standard Dev (σ)</option>
                <option value="cpk">Cpk</option>
            </select>
            <div class="normal-param-inputs-dynamic"></div> 
        </div>
        <button class="delete-dimension-btn" onclick="removeSpecificDimension(this)" title="Remove this dimension">
            <i class="fas fa-times"></i>
        </button>
        <div class="error-message"></div>
        <div class="validation-feedback"></div>
    `;
    container.appendChild(div);
    
    const selectElement = div.querySelector('.dim-distribution');
    
    // Guardar los parámetros específicos en el elemento para usarlos después
    div.dataset.specificParams = JSON.stringify(specificParams);
    
    updateDistributionInputs(selectElement, nominal, tolerance, normalParams.paramType, normalParams.paramType === 'sigma' ? normalParams.sigma : normalParams.cpk);
    
    // Después de actualizar los inputs, establecer los valores específicos si existen
    setTimeout(() => {
        if (Object.keys(specificParams).length > 0) {
            applySpecificParams(div, specificParams);
        }
    }, 100);

    dimensionCount++;
    updateVisualization();
}

// Nueva función para aplicar parámetros específicos
function applySpecificParams(container, specificParams) {
    const dynamicDiv = container.querySelector('.normal-param-inputs-dynamic');
    if (!dynamicDiv) return;
    
    Object.keys(specificParams).forEach(param => {
        const input = dynamicDiv.querySelector(`[class*="${param}"]`);
        if (input) {
            input.value = specificParams[param];
            // Disparar evento input para validación
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        }
    });
}

// CORREGIDA: Ejemplo con parámetros más estables
function loadExampleData() {
    const container = document.getElementById('dimensions-container');
    container.innerHTML = '';
    dimensionCount = 0;

    // Dimensión A: Normal (válida por defecto)
    addDimension('A', 10, {plus: 0.1, minus: 0.1}, 'normal', {paramType: 'tolerance'}, '+'); 

    // Dimensión B: Lognormal - parámetros más estables
    let gammaB = 9.0;  // Más cercano al nominal
    let sigmaLogB = 0.05; // Menor desviación
    let muB = Math.log(10 - gammaB); // Ajustado para nominal 10
    addDimension('B', 10, {plus: 0.15, minus: 0.05}, 'lognormal', {paramType: 'tolerance'}, '+', {
        mu: muB,
        'sigma-log': sigmaLogB,
        gamma: gammaB
    });

    // Dimensión C: Beta - parámetros más conservadores
    let AC = 9.7;
    let BC = 10.5;
    let alphaC = 3;  // Mayor alpha para más estabilidad
    let betaShapeC = 3; // Mayor beta para más estabilidad
    addDimension('C', 10, {plus: 0.2, minus: 0.2}, 'beta', {paramType: 'tolerance'}, '-', {
        alpha: alphaC,
        'beta-shape': betaShapeC,
        a: AC,
        b: BC
    });

    // Dimensión D: Exponential - parámetros más realistas
    let gammaD = 9.0;
    let lambdaD = 2;
    addDimension('D', 9.5, {plus: 0.1, minus: 0.05}, 'exponential', {paramType: 'tolerance'}, '+', {
        lambda: lambdaD,
        gamma: gammaD
    });

    updateVisualization();
}

function removeSpecificDimension(button) {
    const container = document.getElementById('dimensions-container');
    const dimensionElement = button.closest('.dimension-input');
    
    if (dimensionElement) {
        container.removeChild(dimensionElement);
        dimensionCount--;
        
        if (container.querySelectorAll('.dimension-input').length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No dimensions added yet</p>
                    <p style="font-size: 0.9rem;">Click "Add Dimension" below to start building your tolerance stack-up analysis</p>
                </div>
            `;
        }
        
        updateVisualization();
    }
}

function toggleSign(button) {
    const container = button.closest('.dimension-input');
    const buttons = container.querySelectorAll('.sign-btn');
    
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
    updateVisualization();
}

function resetData() {
    const container = document.getElementById('dimensions-container');
    container.innerHTML = '';
    dimensionCount = 0;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No dimensions added yet</p>
            <p style="font-size: 0.9rem;">Click "Add Dimension" below to start building your tolerance stack-up analysis</p>
        </div>
    `;
    
    document.getElementById('arithmetic-nominal').textContent = '-';
    document.getElementById('arithmetic-tolerance').textContent = '-';
    document.getElementById('arithmetic-max').textContent = '-';
    document.getElementById('arithmetic-min').textContent = '-';
    
    document.getElementById('probabilistic-nominal').textContent = '-';
    document.getElementById('probabilistic-stddev').textContent = '-';
    document.getElementById('probabilistic-tolerance').textContent = '-';
    document.getElementById('probabilistic-max').textContent = '-';
    document.getElementById('probabilistic-min').textContent = '-';
    
    document.getElementById('montecarlo-nominal').textContent = '-';
    document.getElementById('montecarlo-stddev').textContent = '-';
    document.getElementById('montecarlo-tolerance').textContent = '-';
    document.getElementById('montecarlo-max').textContent = '-';
    document.getElementById('montecarlo-min').textContent = '-';
    
    document.getElementById('montecarlo-results').style.display = 'none';
    document.getElementById('rss-results').style.display = 'block';
    
    if (chart) {
        chart.destroy();
        chart = null;
    }
    
    calculationHistory = [];
    document.getElementById('results-history').style.display = 'none';
    
    updateVisualization();
}

function listResults() {
    const historyDiv = document.getElementById('results-history');
    historyDiv.style.display = 'block';
    historyDiv.innerHTML = '';

    if (calculationHistory.length === 0) {
        historyDiv.innerHTML = '<p>No calculations performed yet. Click "Calculate" to start.</p>';
        return;
    }

    calculationHistory.forEach((record, index) => {
        const block = document.createElement('div');
        block.className = 'calculation-block';
        
        let dimsTable = `
            <h4>Input Data (Calculation #${record.id})</h4>
            <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Sign</th>
                        <th>Nominal</th>
                        <th>Distribution</th>
                        <th>Std Dev (σ)</th>
                        <th>Params</th>
                    </tr>
                </thead>
                <tbody>
        `;
        record.dimensions.forEach(dim => {
             let paramDetail = '';
             if (dim.distribution === 'normal') {
                 paramDetail = `Type: ${dim.additionalParams.paramType}`;
                 if (dim.additionalParams.cpk) paramDetail += `, Cpk: ${dim.additionalParams.cpk.toFixed(2)}`;
                 if (dim.additionalParams.sigma) paramDetail += `, σ: ${dim.additionalParams.sigma.toFixed(4)}`;
                 paramDetail += `, Tol: +${dim.tolerancePlus.toFixed(4)} / -${dim.toleranceMinus.toFixed(4)}`;
             } else if (dim.distribution === 'homo') {
                 paramDetail = `Min (A): ${dim.additionalParams.A.toFixed(4)}, Max (B): ${dim.additionalParams.B.toFixed(4)}`;
             } else if (dim.distribution === 'triangular') {
                 paramDetail = `Min (A): ${dim.additionalParams.A.toFixed(4)}, Mode (C): ${dim.additionalParams.C.toFixed(4)}, Max (B): ${dim.additionalParams.B.toFixed(4)}`;
             } else if (dim.distribution === 'weibull') {
                 paramDetail = `Shape (β): ${dim.additionalParams.beta.toFixed(2)}, Scale (η): ${dim.additionalParams.eta.toFixed(4)}, Loc (γ): ${dim.additionalParams.gamma.toFixed(4)}`;
             } else if (dim.distribution === 'lognormal') {
                 paramDetail = `μ: ${dim.additionalParams.mu.toFixed(4)}, σ: ${dim.additionalParams.sigmaLog.toFixed(4)}, Loc (γ): ${dim.additionalParams.gamma.toFixed(4)}`;
             } else if (dim.distribution === 'beta') {
                 paramDetail = `α: ${dim.additionalParams.alpha.toFixed(2)}, β: ${dim.additionalParams.betaShape.toFixed(2)}, Min: ${dim.additionalParams.A.toFixed(4)}, Max: ${dim.additionalParams.B.toFixed(4)}`;
             } else if (dim.distribution === 'exponential') {
                 paramDetail = `λ: ${dim.additionalParams.lambda.toFixed(4)}, Loc (γ): ${dim.additionalParams.gamma.toFixed(4)}`;
             }

            dimsTable += `
                <tr>
                    <td>${dim.name}</td>
                    <td>${dim.sign > 0 ? '+' : '-'}</td>
                    <td>${dim.nominal.toFixed(4)}</td>
                    <td>${dim.distribution}</td>
                    <td>${dim.stddev.toFixed(6)}</td>
                    <td>${paramDetail}</td>
                </tr>
            `;
        });
        dimsTable += '</tbody></table></div>';
        
        let resultsTable = `
            <h4 style="margin-top: 1.5rem;">Results (Method: ${record.method})</h4>
            <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Method</th>
                        <th>Nominal</th>
                        <th>Tolerance</th>
                        <th>Max Result</th>
                        <th>Min Result</th>
                        <th>Std Dev (σ)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Arithmetic (Worst-Case)</td>
                        <td>${record.arithmetic.nominal.toFixed(4)}</td>
                        <td>+${record.arithmetic.tolerancePlus.toFixed(4)} / -${record.arithmetic.toleranceMinus.toFixed(4)}</td>
                        <td>${record.arithmetic.max.toFixed(4)}</td>
                        <td>${record.arithmetic.min.toFixed(4)}</td>
                        <td>N/A</td>
                    </tr>
        `;
        
        // CORRECCIÓN: Mostrar solo los métodos correspondientes al cálculo realizado
        if (record.method === 'RSS') {
            resultsTable += `
                <tr>
                    <td>Probabilistic (RSS)</td>
                    <td>${record.probabilistic.nominal.toFixed(4)}</td>
                    <td>±${record.probabilistic.tolerance.toFixed(4)} (3σ)</td>
                    <td>${record.probabilistic.max.toFixed(4)}</td>
                    <td>${record.probabilistic.min.toFixed(4)}</td>
                    <td>${record.probabilistic.stddev.toFixed(6)}</td>
                </tr>
            `;
        } else { // Monte Carlo
            resultsTable += `
                <tr>
                    <td>Monte Carlo (Simulated)</td>
                    <td>${record.monteCarlo.nominal.toFixed(4)}</td>
                    <td>±${record.monteCarlo.tolerance.toFixed(4)} (3σ)</td>
                    <td>${record.monteCarlo.max.toFixed(4)}</td>
                    <td>${record.monteCarlo.min.toFixed(4)}</td>
                    <td>${record.monteCarlo.stddev.toFixed(6)}</td>
                </tr>
            `;
        }
        
        resultsTable += '</tbody></table></div>';

        block.innerHTML = dimsTable + resultsTable;
        historyDiv.appendChild(block);
    });
    
    setTimeout(() => {
        historyDiv.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function exportToExcel() {
     if (calculationHistory.length === 0) {
        alert('No calculation data to export.');
        return;
    }

    const data = [
        ["Tolerance Stack-Up Analysis Results"],
        []
    ];

    calculationHistory.forEach(record => {
        data.push([`--- Calculation #${record.id} (Method: ${record.method}) ---`]);
        
        data.push(["Dimension Input:"]);
        data.push(["Name", "Sign", "Nominal", "Distribution", "Std Dev (σ)", "Parameters"]);
        record.dimensions.forEach(dim => {
            let paramDetail = '';
             if (dim.distribution === 'normal') {
                 paramDetail = `Type: ${dim.additionalParams.paramType}`;
                 if (dim.additionalParams.cpk) paramDetail += `, Cpk: ${dim.additionalParams.cpk.toFixed(2)}`;
                 if (dim.additionalParams.sigma) paramDetail += `, σ: ${dim.additionalParams.sigma.toFixed(4)}`;
                  paramDetail += `, Tol: +${dim.tolerancePlus.toFixed(4)} / -${dim.toleranceMinus.toFixed(4)}`;
             } else if (dim.distribution === 'homo') {
                 paramDetail = `Min (A): ${dim.additionalParams.A.toFixed(4)}, Max (B): ${dim.additionalParams.B.toFixed(4)}`;
             } else if (dim.distribution === 'triangular') {
                 paramDetail = `Min (A): ${dim.additionalParams.A.toFixed(4)}, Mode (C): ${dim.additionalParams.C.toFixed(4)}, Max (B): ${dim.additionalParams.B.toFixed(4)}`;
             } else if (dim.distribution === 'weibull') {
                 paramDetail = `Shape (β): ${dim.additionalParams.beta.toFixed(2)}, Scale (η): ${dim.additionalParams.eta.toFixed(4)}, Loc (γ): ${dim.additionalParams.gamma.toFixed(4)}`;
             } else if (dim.distribution === 'lognormal') {
                 paramDetail = `μ: ${dim.additionalParams.mu.toFixed(4)}, σ: ${dim.additionalParams.sigmaLog.toFixed(4)}, Loc (γ): ${dim.additionalParams.gamma.toFixed(4)}`;
             } else if (dim.distribution === 'beta') {
                 paramDetail = `α: ${dim.additionalParams.alpha.toFixed(2)}, β: ${dim.additionalParams.betaShape.toFixed(2)}, Min: ${dim.additionalParams.A.toFixed(4)}, Max: ${dim.additionalParams.B.toFixed(4)}`;
             } else if (dim.distribution === 'exponential') {
                 paramDetail = `λ: ${dim.additionalParams.lambda.toFixed(4)}, Loc (γ): ${dim.additionalParams.gamma.toFixed(4)}`;
             }
            data.push([
                dim.name,
                dim.sign > 0 ? '+' : '-',
                dim.nominal.toFixed(4),
                dim.distribution,
                dim.stddev.toFixed(6),
                paramDetail
            ]);
        });
        data.push([]);

        data.push(["Final Results:"]);
        data.push(["Method", "Nominal", "Tolerance", "Max Result", "Min Result", "Std Dev (σ)"]);
        data.push([
            "Arithmetic (Worst-Case)",
            record.arithmetic.nominal.toFixed(4),
            `+${record.arithmetic.tolerancePlus.toFixed(4)} / -${record.arithmetic.toleranceMinus.toFixed(4)}`,
            record.arithmetic.max.toFixed(4),
            record.arithmetic.min.toFixed(4),
            "N/A"
        ]);
        
        // CORRECCIÓN: Exportar solo los métodos correspondientes al cálculo realizado
        if (record.method === 'RSS') {
            data.push([
                "Probabilistic (RSS)",
                record.probabilistic.nominal.toFixed(4),
                `±${record.probabilistic.tolerance.toFixed(4)} (3σ)`,
                record.probabilistic.max.toFixed(4),
                record.probabilistic.min.toFixed(4),
                record.probabilistic.stddev.toFixed(6)
            ]);
        } else { // Monte Carlo
            data.push([
                "Monte Carlo (Simulated)",
                record.monteCarlo.nominal.toFixed(4),
                `±${record.monteCarlo.tolerance.toFixed(4)} (3σ)`,
                record.monteCarlo.max.toFixed(4),
                record.monteCarlo.min.toFixed(4),
                record.monteCarlo.stddev.toFixed(6)
            ]);
        }
        
        data.push([]);
        data.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StackUp Analysis");
    XLSX.writeFile(wb, "Tolerance_Stack_Up_Analysis.xlsx");
}

function drawArrowHead(ctx, x, y, angle, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

function drawArrow(ctx, x1, y1, x2, y2, size, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const angle = Math.atan2(y2 - y1, x2 - x1);
    drawArrowHead(ctx, x2, y2, angle, size, color);
}

function drawPerpendicularLine(ctx, x, y, orientation, length) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    if (orientation === 'horizontal') {
        ctx.moveTo(x, y - length / 2);
        ctx.lineTo(x, y + length / 2);
    } else {
        ctx.moveTo(x - length / 2, y);
        ctx.lineTo(x + length / 2, y);
    }
    ctx.stroke();
}

function updateVisualization() {
    requestAnimationFrame(() => {
         const { dimensions } = getDimensionData();
         drawVectors(dimensions, vectorOrientation);
    });
}

function drawVectors(dimensions, orientation) {
    const canvas = document.getElementById('vectorCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);
    ctx.font = "12px 'Nunito', sans-serif";
    
    if (dimensions.length === 0) {
        ctx.fillStyle = '#bdc3c7';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Add dimensions to see visualization', width / 2, height / 2);
        return;
    }

    let min_pos_unscaled = 0, max_pos_unscaled = 0, current_pos_unscaled = 0;
    dimensions.forEach(dim => {
        current_pos_unscaled += dim.nominal * dim.sign;
        min_pos_unscaled = Math.min(min_pos_unscaled, current_pos_unscaled);
        max_pos_unscaled = Math.max(max_pos_unscaled, current_pos_unscaled);
    });
    const total_span_unscaled = max_pos_unscaled - min_pos_unscaled;

    const padding = 40;
    const colors = ['#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
    const resultColor = '#e74c3c';
    const arrowSize = 8;
    const offsetAmount = 30;
    const textOffset = 5;
    const perpLineLength = 15;

    const scale = total_span_unscaled > 0 ? (((orientation === 'horizontal' ? width : height) - 2 * padding) / total_span_unscaled) : 1;
    
    let originX, originY;
    
    const drawingWidth = (orientation === 'horizontal')
        ? total_span_unscaled * scale
        : (dimensions.length + 1.5) * offsetAmount;
    const drawingHeight = (orientation === 'horizontal')
        ? (dimensions.length + 1.5) * offsetAmount
        : total_span_unscaled * scale;

    const drawingStartX = (width - drawingWidth) / 2;
    const drawingStartY = (height - drawingHeight) / 2;

    if (orientation === 'horizontal') {
        originX = drawingStartX - (min_pos_unscaled * scale);
        originY = drawingStartY;
    } else {
        originX = drawingStartX;
        originY = drawingStartY + (max_pos_unscaled * scale);
    }
    
    let current_pos_scaled = 0;
    const initial_x = (orientation === 'horizontal') ? originX : originX + offsetAmount / 2;
    const initial_y = (orientation === 'horizontal') ? originY + offsetAmount / 2 : originY;
    drawPerpendicularLine(ctx, initial_x, initial_y, orientation, perpLineLength);

    dimensions.forEach((dim, i) => {
        const color = colors[i % colors.length];
        ctx.lineWidth = 2;
        const length_scaled = dim.nominal * dim.sign * scale;
        let start_x, start_y, end_x, end_y;

        if (orientation === 'horizontal') {
            start_x = originX + current_pos_scaled;
            start_y = originY + (i + 0.5) * offsetAmount;
            end_x = start_x + length_scaled;
            end_y = start_y;
            
            ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
            ctx.fillStyle = color;
            ctx.fillText((dim.sign > 0 ? '+' : '-') + (dim.name || `Dim ${i+1}`), start_x + length_scaled / 2, start_y - textOffset);
        } else { 
            start_x = originX + (i + 0.5) * offsetAmount;
            start_y = originY - current_pos_scaled;
            end_x = start_x;
            end_y = start_y - length_scaled;

            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillStyle = color;
            ctx.fillText((dim.sign > 0 ? '+' : '-') + (dim.name || `Dim ${i+1}`), start_x + textOffset + 5, start_y - length_scaled / 2);
        }
        
        drawArrow(ctx, start_x, start_y, end_x, end_y, arrowSize, color);
        drawPerpendicularLine(ctx, end_x, end_y, orientation, perpLineLength);
        current_pos_scaled += length_scaled;
    });

    ctx.lineWidth = 4;
    const resultOffset = (dimensions.length + 0.5) * offsetAmount;
    let res_start_x, res_start_y, res_end_x, res_end_y;

    if (orientation === 'horizontal') {
        res_start_x = originX;
        res_start_y = originY + resultOffset;
        res_end_x = originX + current_pos_scaled;
        res_end_y = res_start_y;

        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillStyle = resultColor;
        ctx.fillText('R', res_start_x + current_pos_scaled / 2, res_start_y - textOffset);
    } else {
        res_start_x = originX + resultOffset;
        res_start_y = originY;
        res_end_x = res_start_x;
        res_end_y = originY - current_pos_scaled;
        
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = resultColor;
        ctx.fillText('R', res_start_x + textOffset + 5, res_start_y - current_pos_scaled / 2);
    }

    drawArrow(ctx, res_start_x, res_start_y, res_end_x, res_end_y, arrowSize, resultColor);
    drawPerpendicularLine(ctx, res_start_x, res_start_y, orientation, perpLineLength);
    drawPerpendicularLine(ctx, res_end_x, res_end_y, orientation, perpLineLength);
}

function setVectorOrientation(orientation) {
    vectorOrientation = orientation;
    document.getElementById('vis-horizontal-btn').classList.toggle('active', orientation === 'horizontal');
    document.getElementById('vis-vertical-btn').classList.toggle('active', orientation === 'vertical');
    updateVisualization();
}

function openTab(evt, tabName) {
    document.querySelectorAll(".tabcontent").forEach(el => el.style.display = "none");
    document.querySelectorAll(".tablinks").forEach(el => el.classList.remove("active"));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
    if (tabName === 'input') {
        updateVisualization();
    }
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const toolsDropdownToggle = document.getElementById('tools-dropdown-toggle');
    const toolsDropdownMenu = document.getElementById('tools-dropdown-menu');
    const toolsDropdownContainer = document.getElementById('tools-dropdown-container');

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show-menu');
        const icon = navToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
        
        if (!navMenu.classList.contains('show-menu')) {
            toolsDropdownMenu.classList.remove('show-submenu');
            toolsDropdownContainer.classList.remove('active');
        }
    });
    
    toolsDropdownToggle.addEventListener('click', (event) => {
        if (window.innerWidth <= 992) {
            event.preventDefault(); 
            toolsDropdownMenu.classList.toggle('show-submenu');
            toolsDropdownContainer.classList.toggle('active');
        }
    });
    
    updateVisualization();
    window.addEventListener('resize', updateVisualization);

    document.getElementById('dimensions-container').addEventListener('input', (event) => {
        if (event.target && event.target.matches('.dim-name, .dim-nominal, .normal-param-input')) {
            updateVisualization();
            validateInput(event.target);
        }
    });
    
    document.getElementById('montecarlo-results').style.display = 'none';
});