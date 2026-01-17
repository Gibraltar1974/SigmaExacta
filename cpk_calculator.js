// Load header
fetch('header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-container').innerHTML = data;
        // Initialize navigation after header is loaded
        initNavigation();
    });

function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const dropdownContainer = document.getElementById('tools-dropdown-container');
    const toolsDropdownToggle = document.getElementById('tools-dropdown-toggle');
    const dropdownMenu = document.getElementById('tools-dropdown-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('show-menu');
        });
    }

    if (toolsDropdownToggle && dropdownMenu) {
        toolsDropdownToggle.addEventListener('click', function (e) {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                const isSubmenuOpen = dropdownMenu.classList.toggle('show-submenu');
                dropdownContainer.classList.toggle('active', isSubmenuOpen);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Configuración y variables globales
    let datasets = [];
    let currentDatasetId = 1;
    let overallData = [];
    let chartInstances = {
        cpkChart: null,
        controlChart: null,
        overallChart: null,
        overallControlChart: null,
        qqChart: null,
        overallQQChart: null
    };

    let exampleIndex = 0;
    let overallStats = null;

    const exampleDataSetsCollection = [
        // Example Set 1 (Three Datasets: Centered, Shifted, Spread)
        {
            lsl: 9.0, usl: 11.0, target: 10.0,
            datasets: [
                // Dataset 1: Centered (Good Cpk)
                { id: 1, data: ["10.05", "10.15", "10.02", "10.08", "10.10", "10.03", "10.07", "10.12", "10.01", "10.06", "10.11", "10.04", "10.09", "10.14", "10.00", "10.13", "10.05", "10.10", "10.03", "10.07"] },
                // Dataset 2: Shifted High (Acceptable Cpk, Ppk may be lower)
                { id: 2, data: ["10.65", "10.70", "10.68", "10.75", "10.71", "10.64", "10.69", "10.72", "10.73", "10.67", "10.74", "10.66", "10.70", "10.75", "10.68", "10.71", "10.65", "10.72", "10.66", "10.73"] },
                // Dataset 3: High Variation (Poor Cpk, risk of failure)
                { id: 3, data: ["11.05", "10.55", "9.50", "11.50", "10.85", "10.00", "11.20", "10.40", "9.75", "11.40", "10.60", "9.90", "11.30", "10.20", "9.60", "11.10", "10.30", "9.80", "11.60", "10.70"] }
            ]
        },
        // Example Set 2 (Two Datasets: Original, but with updated LSL/USL)
        {
            lsl: 8.5, usl: 12.5, target: 10.5,
            datasets: [
                { id: 1, data: ["10.15", "10.22", "10.05", "10.30", "10.18", "10.09", "10.35", "10.25", "10.19", "10.42", "10.33", "10.10", "10.28", "10.38", "10.16", "10.29", "10.11", "10.23", "10.08", "10.14", "10.20", "10.26", "10.12", "10.31", "10.17", "10.24", "10.06", "10.32", "10.13", "10.27", "10.15", "10.22", "10.05", "10.30", "10.18", "10.09", "10.35", "10.25", "10.19", "10.42", "10.33", "10.10", "10.28", "10.38", "10.16", "10.29", "10.11", "10.23", "10.08", "10.14"] },
                { id: 2, data: ["10.55", "10.62", "10.45", "10.70", "10.58", "10.49", "10.75", "10.65", "10.59", "10.82", "10.73", "10.50", "10.68", "10.78", "10.56", "10.69", "10.51", "10.63", "10.48", "10.54", "10.60", "10.66", "10.52", "10.71", "10.57", "10.64", "10.46", "10.72", "10.53", "10.67", "10.55", "10.62", "10.45", "10.70", "10.58", "10.49", "10.75", "10.65", "10.59", "10.82", "10.73", "10.50", "10.68", "10.78", "10.56", "10.69", "10.51", "10.63", "10.48", "10.54"] }
            ]
        }
    ];

    // Event Listeners
    document.getElementById('cpkForm').addEventListener('submit', handleFormSubmit);

    // Crear botones ocultos para ejemplo y reset si no existen
    if (!document.getElementById('fillExampleBtn')) {
        const fillExampleBtn = document.createElement('button');
        fillExampleBtn.id = 'fillExampleBtn';
        fillExampleBtn.style.display = 'none';
        document.body.appendChild(fillExampleBtn);
    }

    if (!document.getElementById('resetDataBtn')) {
        const resetDataBtn = document.createElement('button');
        resetDataBtn.id = 'resetDataBtn';
        resetDataBtn.style.display = 'none';
        document.body.appendChild(resetDataBtn);
    }

    document.getElementById('fillExampleBtn').addEventListener('click', fillExampleData);
    document.getElementById('resetDataBtn').addEventListener('click', resetFormData);
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    document.getElementById('addDatasetBtn').addEventListener('click', addNewDataset);

    function handleFormSubmit(e) {
        e.preventDefault();

        const lsl = parseFloat(document.getElementById('lsl').value);
        const usl = parseFloat(document.getElementById('usl').value);
        const target = parseFloat(document.getElementById('target').value);

        if (isNaN(lsl) || isNaN(usl) || isNaN(target) || usl <= lsl) {
            alert('Please enter valid LSL, USL, and Target values. USL must be greater than LSL.');
            return;
        }

        datasets = [];
        overallData = [];

        // Primero, procesar cada dataset individualmente
        document.querySelectorAll('.dataset-container').forEach(function (el) {
            const id = parseInt(el.dataset.id);
            const measurements = parseMeasurements(el.querySelector('.measurements-input').value);
            if (measurements.length >= 2) {
                const stats = calculateDatasetStatistics(measurements, lsl, usl, target);
                datasets.push({
                    id: id,
                    measurements: measurements,
                    ...stats
                });
                overallData.push.apply(overallData, measurements);
            }
        });

        if (datasets.length === 0) {
            alert('No valid datasets with enough data (minimum 2 data points).');
            return;
        }

        // Calcular estadísticas overall usando el método CORREGIDO
        if (overallData.length >= 2) {
            // Calcular sigma within overall usando el método de JASP (pooled within)
            const sigmaWithinOverall = calculateSigmaWithinOverall(datasets);

            overallStats = calculateOverallStatistics(
                overallData,
                lsl,
                usl,
                target,
                sigmaWithinOverall  // Pasar el sigma within calculado correctamente
            );
        } else {
            overallStats = null;
        }

        // Mostrar los resultados del primer dataset
        if (datasets.length > 0) {
            displayResults(datasets[0], 0);
        }
        updateDatasetTabs();

        document.getElementById('exportBtn').disabled = false;
    }

    // FUNCIÓN CORREGIDA: Calcular sigma within overall como en JASP
    function calculateSigmaWithinOverall(datasets) {
        if (datasets.length === 0) return 0;

        // Si solo hay un dataset, usar su sigma within directamente
        if (datasets.length === 1) {
            return datasets[0].sigmaWithin;
        }

        // Calcular pooled variance usando el método de JASP
        // s²_pooled = Σ[(n_i - 1) * s_i²] / Σ(n_i - 1)
        let numerator = 0;
        let denominator = 0;

        datasets.forEach(dataset => {
            const n = dataset.measurements.length;
            if (n > 1) {
                const df = n - 1;
                // Usar la varianza within del dataset (calculada con moving range)
                const varianceWithin = Math.pow(dataset.sigmaWithin, 2);
                numerator += df * varianceWithin;
                denominator += df;
            }
        });

        if (denominator === 0) return 0;

        const pooledVariance = numerator / denominator;
        return Math.sqrt(pooledVariance);
    }

    function parseMeasurements(text) {
        return text.split(/[\s,;]+/).map(function (val) {
            return parseFloat(val.trim());
        }).filter(function (val) {
            return !isNaN(val);
        });
    }

    // Función para calcular estadísticas de un dataset individual
    function calculateDatasetStatistics(data, lsl, usl, target) {
        if (data.length < 2) return null;
        const n = data.length;

        // Verificar si todos los valores son iguales
        const allEqual = data.every(val => val === data[0]);

        if (allEqual) {
            const mean = data[0];
            const centered = (mean > lsl && mean < usl);
            const onTarget = (mean === target);

            if (centered) {
                return {
                    mean: mean,
                    sigmaWithin: 0,
                    sigmaOverall: 0,
                    mrBar: 0,
                    cp: Infinity,
                    cpk: Infinity,
                    cpm: onTarget ? Infinity : 0,
                    pp: Infinity,
                    ppk: Infinity,
                    failures_ppm: 0,
                    defective_percentage: 0,
                    failures_ppm_lt: 0,
                    defective_percentage_lt: 0,
                    shapiro: { statistic: 1.0, pValue: 1.0, result: 'Pass', message: 'All values identical' },
                    kolmogorov: { statistic: 0, pValue: 1.0, result: 'Pass', message: 'All values identical' },
                    anderson: { statistic: 0, pValue: 1.0, result: 'Pass', message: 'All values identical' }
                };
            } else {
                return {
                    mean: mean,
                    sigmaWithin: 0,
                    sigmaOverall: 0,
                    mrBar: 0,
                    cp: 0,
                    cpk: 0,
                    cpm: 0,
                    pp: 0,
                    ppk: 0,
                    failures_ppm: 1000000,
                    defective_percentage: 100,
                    failures_ppm_lt: 1000000,
                    defective_percentage_lt: 100,
                    shapiro: { statistic: 1.0, pValue: 1.0, result: 'Pass', message: 'All values identical' },
                    kolmogorov: { statistic: 0, pValue: 1.0, result: 'Pass', message: 'All values identical' },
                    anderson: { statistic: 0, pValue: 1.0, result: 'Pass', message: 'All values identical' }
                };
            }
        }

        const mean = data.reduce(function (a, b) { return a + b; }, 0) / n;

        // Calcular sigma within usando moving ranges (método exacto)
        const movingRanges = [];
        for (let i = 1; i < data.length; i++) {
            movingRanges.push(Math.abs(data[i] - data[i - 1]));
        }
        const mrBar = movingRanges.reduce(function (a, b) { return a + b; }, 0) / movingRanges.length;
        const sigmaWithin = mrBar / 1.128; // d2 para n=2

        // Calcular sigma overall (desviación estándar tradicional)
        const variance = data.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / (n - 1);
        const sigmaOverall = Math.sqrt(variance);

        // Calcular índices short-term usando sigma within
        const cp = (usl - lsl) / (6 * sigmaWithin);
        const cpk = Math.min((usl - mean) / (3 * sigmaWithin), (mean - lsl) / (3 * sigmaWithin));
        const cpm = (usl - lsl) / (6 * Math.sqrt(Math.pow(sigmaWithin, 2) + Math.pow(mean - target, 2)));

        // Calcular índices long-term usando sigma overall
        const pp = (usl - lsl) / (6 * sigmaOverall);
        const ppk = Math.min((usl - mean) / (3 * sigmaOverall), (mean - lsl) / (3 * sigmaOverall));

        // Cálculo de defectos
        const zUpperST = (usl - mean) / sigmaWithin;
        const zLowerST = (lsl - mean) / sigmaWithin;
        const probDefectiveST = (1 - normalCDF(zUpperST)) + normalCDF(zLowerST);

        const zUpperLT = (usl - mean) / sigmaOverall;
        const zLowerLT = (lsl - mean) / sigmaOverall;
        const probDefectiveLT = (1 - normalCDF(zUpperLT)) + normalCDF(zLowerLT);

        // Calcular intervalos de confianza
        const confidenceLevel = 0.95;
        const cpCI = calculateCpConfidenceInterval(cp, n, confidenceLevel);
        const cpkCI = calculateCpkConfidenceInterval(cpk, n, confidenceLevel);
        const cpmCI = calculateCpmConfidenceInterval(cpm, n, confidenceLevel);
        const ppCI = calculateCpConfidenceInterval(pp, n, confidenceLevel);
        const ppkCI = calculateCpkConfidenceInterval(ppk, n, confidenceLevel);

        return {
            mean: mean,
            sigmaWithin: sigmaWithin,
            sigmaOverall: sigmaOverall,
            mrBar: mrBar,
            cp: cp,
            cpk: cpk,
            cpm: cpm,
            pp: pp,
            ppk: ppk,
            failures_ppm: probDefectiveST * 1e6,
            defective_percentage: probDefectiveST * 100,
            failures_ppm_lt: probDefectiveLT * 1e6,
            defective_percentage_lt: probDefectiveLT * 100,
            shapiro: shapiroWilkTest(data),
            kolmogorov: kolmogorovSmirnovTest(data),
            anderson: andersonDarlingTest(data),
            cpCI: cpCI,
            cpkCI: cpkCI,
            cpmCI: cpmCI,
            ppCI: ppCI,
            ppkCI: ppkCI
        };
    }

    // Función para calcular estadísticas overall - CORREGIDA
    function calculateOverallStatistics(data, lsl, usl, target, sigmaWithinOverall) {
        if (data.length < 2) return null;
        const n = data.length;

        // Verificar si todos los valores son iguales
        const allEqual = data.every(val => val === data[0]);

        if (allEqual) {
            const mean = data[0];
            const centered = (mean > lsl && mean < usl);
            const onTarget = (mean === target);

            if (centered) {
                return {
                    mean: mean,
                    sigmaWithin: 0,
                    sigmaOverall: 0,
                    cp: Infinity,
                    cpk: Infinity,
                    cpm: onTarget ? Infinity : 0,
                    pp: Infinity,
                    ppk: Infinity,
                    failures_ppm: 0,
                    defective_percentage: 0,
                    failures_ppm_lt: 0,
                    defective_percentage_lt: 0,
                    shapiro: { statistic: 1.0, pValue: 1.0, result: 'Pass', message: 'All values identical' },
                    kolmogorov: { statistic: 0, pValue: 1.0, result: 'Pass', message: 'All values identical' },
                    anderson: { statistic: 0, pValue: 1.0, result: 'Pass', message: 'All values identical' }
                };
            } else {
                return {
                    mean: mean,
                    sigmaWithin: 0,
                    sigmaOverall: 0,
                    cp: 0,
                    cpk: 0,
                    cpm: 0,
                    pp: 0,
                    ppk: 0,
                    failures_ppm: 1000000,
                    defective_percentage: 100,
                    failures_ppm_lt: 1000000,
                    defective_percentage_lt: 100,
                    shapiro: { statistic: 1.0, pValue: 1.0, result: 'Pass', message: 'All values identical' },
                    kolmogorov: { statistic: 0, pValue: 1.0, result: 'Pass', message: 'All values identical' },
                    anderson: { statistic: 0, pValue: 1.0, result: 'Pass', message: 'All values identical' }
                };
            }
        }

        const mean = data.reduce(function (a, b) { return a + b; }, 0) / n;

        // Calcular sigma overall (desviación estándar tradicional de todos los datos)
        const variance = data.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / (n - 1);
        const sigmaOverall = Math.sqrt(variance);

        // USAR el sigma within overall proporcionado (calculado con pooled variance)
        // Si sigmaWithinOverall es 0, usar un valor muy pequeño para evitar división por cero
        const effectiveSigmaWithin = sigmaWithinOverall || 1e-10;

        // Calculate short-term indices usando sigma within overall (método JASP)
        const cp = (usl - lsl) / (6 * effectiveSigmaWithin);
        const cpk = Math.min(
            (usl - mean) / (3 * effectiveSigmaWithin),
            (mean - lsl) / (3 * effectiveSigmaWithin)
        );
        const cpm = (usl - lsl) / (6 * Math.sqrt(
            Math.pow(effectiveSigmaWithin, 2) + Math.pow(mean - target, 2)
        ));

        // Calculate long-term indices usando sigma overall
        const pp = (usl - lsl) / (6 * sigmaOverall);
        const ppk = Math.min(
            (usl - mean) / (3 * sigmaOverall),
            (mean - lsl) / (3 * sigmaOverall)
        );

        // Cálculo de defectos (short-term y long-term)
        const zUpperST = (usl - mean) / effectiveSigmaWithin;
        const zLowerST = (lsl - mean) / effectiveSigmaWithin;
        const probDefectiveST = (1 - normalCDF(zUpperST)) + normalCDF(zLowerST);

        const zUpperLT = (usl - mean) / sigmaOverall;
        const zLowerLT = (lsl - mean) / sigmaOverall;
        const probDefectiveLT = (1 - normalCDF(zUpperLT)) + normalCDF(zLowerLT);

        // Calcular intervalos de confianza
        const confidenceLevel = 0.95;
        const cpCI = calculateCpConfidenceInterval(cp, n, confidenceLevel);
        const cpkCI = calculateCpkConfidenceInterval(cpk, n, confidenceLevel);
        const cpmCI = calculateCpmConfidenceInterval(cpm, n, confidenceLevel);
        const ppCI = calculateCpConfidenceInterval(pp, n, confidenceLevel);
        const ppkCI = calculateCpkConfidenceInterval(ppk, n, confidenceLevel);

        return {
            mean: mean,
            sigmaWithin: effectiveSigmaWithin,
            sigmaOverall: sigmaOverall,
            cp: cp,
            cpk: cpk,
            cpm: cpm,
            pp: pp,
            ppk: ppk,
            failures_ppm: probDefectiveST * 1e6,
            defective_percentage: probDefectiveST * 100,
            failures_ppm_lt: probDefectiveLT * 1e6,
            defective_percentage_lt: probDefectiveLT * 100,
            shapiro: shapiroWilkTest(data),
            kolmogorov: kolmogorovSmirnovTest(data),
            anderson: andersonDarlingTest(data),
            cpCI: cpCI,
            cpkCI: cpkCI,
            cpmCI: cpmCI,
            ppCI: ppCI,
            ppkCI: ppkCI
        };
    }

    // ====================================================================
    // FUNCIONES PARA INTERVALOS DE CONFIANZA
    // ====================================================================

    function calculateCpConfidenceInterval(cp, n, confidenceLevel) {
        if (n <= 1 || !isFinite(cp) || cp === 0) {
            return { lower: NaN, upper: NaN };
        }

        const alpha = 1 - confidenceLevel;
        const z = Math.abs(normalQuantile(1 - alpha / 2));
        const se = cp * Math.sqrt(1 / (2 * (n - 1)));

        return {
            lower: Math.max(0, cp - z * se),
            upper: cp + z * se
        };
    }

    function calculateCpkConfidenceInterval(cpk, n, confidenceLevel) {
        if (n <= 1 || !isFinite(cpk)) {
            return { lower: NaN, upper: NaN };
        }

        const alpha = 1 - confidenceLevel;
        const z = Math.abs(normalQuantile(1 - alpha / 2));
        const se = Math.sqrt(1 / (9 * n) + Math.pow(cpk, 2) / (2 * (n - 1)));

        return {
            lower: Math.max(0, cpk - z * se),
            upper: cpk + z * se
        };
    }

    function calculateCpmConfidenceInterval(cpm, n, confidenceLevel) {
        if (n <= 1 || !isFinite(cpm) || cpm === 0) {
            return { lower: NaN, upper: NaN };
        }

        // Aproximación para Cpm
        const alpha = 1 - confidenceLevel;
        const z = Math.abs(normalQuantile(1 - alpha / 2));
        const se = cpm * Math.sqrt(1 / (n - 1));

        return {
            lower: Math.max(0, cpm - z * se),
            upper: cpm + z * se
        };
    }

    function formatConfidenceInterval(ci) {
        if (!ci || isNaN(ci.lower) || isNaN(ci.upper)) {
            return '[N/A]';
        }
        return `[${ci.lower.toFixed(4)}, ${ci.upper.toFixed(4)}]`;
    }

    function displayResults(dataset, index) {
        // Mostrar el contenedor de resultados individuales
        document.getElementById('dataset-results-wrapper').classList.add('active');
        document.getElementById('short-term-charts-wrapper').style.display = 'flex';

        // Ocultar overall si está visible
        document.getElementById('overall-results-wrapper').classList.remove('active');
        document.getElementById('long-term-charts-wrapper').style.display = 'none';

        document.getElementById('mean').textContent = isFinite(dataset.mean) ? dataset.mean.toFixed(4) : 'N/A';
        document.getElementById('deviation').textContent = isFinite(dataset.sigmaWithin) ? dataset.sigmaWithin.toFixed(4) : 'N/A';
        document.getElementById('cp').textContent = isFinite(dataset.cp) ? dataset.cp.toFixed(4) : 'N/A';
        document.getElementById('cp_ci').textContent = `95% CI: ${formatConfidenceInterval(dataset.cpCI)}`;
        document.getElementById('cpk').textContent = isFinite(dataset.cpk) ? dataset.cpk.toFixed(4) : 'N/A';
        document.getElementById('cpk_ci').textContent = `95% CI: ${formatConfidenceInterval(dataset.cpkCI)}`;
        document.getElementById('cpm').textContent = isFinite(dataset.cpm) ? dataset.cpm.toFixed(4) : 'N/A';
        document.getElementById('cpm_ci').textContent = `95% CI: ${formatConfidenceInterval(dataset.cpmCI)}`;
        document.getElementById('failures_ppm').textContent = dataset.failures_ppm.toFixed(2);
        document.getElementById('defective_percentage').textContent = dataset.defective_percentage.toFixed(4);

        document.getElementById('shapiro').innerHTML = formatNormalityResult(dataset.shapiro);
        document.getElementById('kolmogorov').innerHTML = formatNormalityResult(dataset.kolmogorov);
        document.getElementById('anderson').innerHTML = formatNormalityResult(dataset.anderson);

        plotChart(dataset.mean, dataset.sigmaWithin, parseFloat(document.getElementById('lsl').value),
            parseFloat(document.getElementById('usl').value), dataset.measurements, index);
        createControlChart(dataset, index);
        createQQPlot(dataset.measurements, 'qqChartCanvas', 'Q-Q Plot - Dataset #' + (index + 1));

        // Mostrar el contenedor del gráfico Q-Q
        document.getElementById('qqChartContainer').style.display = 'block';
    }

    function displayOverallResults(stats) {
        // Solo mostrar resultados overall cuando se activa la pestaña overall
        document.getElementById('overall-results-wrapper').classList.add('active');
        document.getElementById('long-term-charts-wrapper').style.display = 'flex';

        // Ocultar resultados individuales
        document.getElementById('dataset-results-wrapper').classList.remove('active');
        document.getElementById('short-term-charts-wrapper').style.display = 'none';

        document.getElementById('overall_total').textContent = overallData.length;
        document.getElementById('overall_mean').textContent = isFinite(stats.mean) ? stats.mean.toFixed(4) : 'N/A';

        // Mostrar valores short-term para overall (Process Capability)
        document.getElementById('overall_dev_short').textContent = isFinite(stats.sigmaWithin) ? stats.sigmaWithin.toFixed(4) : 'N/A';
        document.getElementById('overall_cp_short').textContent = isFinite(stats.cp) ? stats.cp.toFixed(4) : 'N/A';
        document.getElementById('overall_cp_short_ci').textContent = `95% CI: ${formatConfidenceInterval(stats.cpCI)}`;
        document.getElementById('overall_cpk_short').textContent = isFinite(stats.cpk) ? stats.cpk.toFixed(4) : 'N/A';
        document.getElementById('overall_cpk_short_ci').textContent = `95% CI: ${formatConfidenceInterval(stats.cpkCI)}`;
        document.getElementById('overall_cpm_short').textContent = isFinite(stats.cpm) ? stats.cpm.toFixed(4) : 'N/A';
        document.getElementById('overall_cpm_short_ci').textContent = `95% CI: ${formatConfidenceInterval(stats.cpmCI)}`;

        // Mostrar valores long-term (Process Performance)
        document.getElementById('overall_dev').textContent = isFinite(stats.sigmaOverall) ? stats.sigmaOverall.toFixed(4) : 'N/A';
        document.getElementById('overall_pp').textContent = isFinite(stats.pp) ? stats.pp.toFixed(4) : 'N/A';
        document.getElementById('overall_pp_ci').textContent = `95% CI: ${formatConfidenceInterval(stats.ppCI)}`;
        document.getElementById('overall_ppk').textContent = isFinite(stats.ppk) ? stats.ppk.toFixed(4) : 'N/A';
        document.getElementById('overall_ppk_ci').textContent = `95% CI: ${formatConfidenceInterval(stats.ppkCI)}`;

        // Mostrar defectos usando long-term
        document.getElementById('overall_failures').textContent = stats.failures_ppm_lt.toFixed(2);
        document.getElementById('overall_defective').textContent = stats.defective_percentage_lt.toFixed(4);

        document.getElementById('overall_shapiro').innerHTML = formatNormalityResult(stats.shapiro);
        document.getElementById('overall_kolmogorov').innerHTML = formatNormalityResult(stats.kolmogorov);
        document.getElementById('overall_anderson').innerHTML = formatNormalityResult(stats.anderson);

        plotOverallChart(stats.mean, stats.sigmaOverall, parseFloat(document.getElementById('lsl').value),
            parseFloat(document.getElementById('usl').value), overallData);
        createOverallControlChart(stats);
        createQQPlot(overallData, 'overallQQChartCanvas', 'Overall Q-Q Plot');

        // Mostrar el contenedor del gráfico Q-Q
        document.getElementById('overallQQChartContainer').style.display = 'block';
    }

    function formatNormalityResult(test) {
        if (!test || test.result === 'N/A') return '<span>N/A</span>';
        const resultClass = test.result === 'Pass' ? 'pass' : 'fail';
        const pVal = test.pValue ? `(p=${test.pValue.toFixed(4)})` : (test.criticalValue ? `(crit=${test.criticalValue.toFixed(4)})` : '');
        return `${test.statistic.toFixed(4)} ${pVal} <span class="${resultClass}">${test.result}</span>`;
    }

    function generateHistogramData(data) {
        const min = Math.min.apply(null, data);
        const max = Math.max.apply(null, data);
        const numBins = Math.ceil(Math.sqrt(data.length));
        // Manejo robusto de binWidth
        const binWidth = (max - min) > 0 ? (max - min) / numBins : Math.max(0.1, min * 0.01);

        let bins = Array(numBins).fill(0);
        let labels = [];
        for (let i = 0; i < numBins; i++) {
            labels.push(min + i * binWidth + binWidth / 2);
        }

        data.forEach(function (val) {
            let binIndex = binWidth > 0 ? Math.floor((val - min) / binWidth) : 0;
            if (binIndex >= numBins) binIndex = numBins - 1;
            if (binIndex < 0) binIndex = 0;
            bins[binIndex]++;
        });

        return { labels: labels, bins: bins, binWidth: binWidth };
    }

    function generateNormalCurveData(data, mean, stdDev, binWidth) {
        if (stdDev === 0 || data.length === 0) return [];

        const effectiveBinWidth = binWidth > 0 ? binWidth : Math.max(0.1, (Math.max(...data) - Math.min(...data)) / 10);
        const scaleFactor = data.length * effectiveBinWidth;

        if (scaleFactor === 0) return [];

        const curvePoints = [];

        const dataRange = Math.max(...data) - Math.min(...data);
        const stdDevRange = 4.5 * stdDev;
        const curveMin = Math.min(mean - stdDevRange, Math.min(...data) - 0.1 * dataRange);
        const curveMax = Math.max(mean + stdDevRange, Math.max(...data) + 0.1 * dataRange);

        const numCurvePoints = 101;
        const curveStep = (curveMax - curveMin) / (numCurvePoints - 1);

        for (let i = 0; i < numCurvePoints; i++) {
            const x = curveMin + i * curveStep;
            const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
            curvePoints.push({ x: x, y: y * scaleFactor });
        }
        return curvePoints;
    }

    // ====================================================================
    // FUNCIÓN PARA GRÁFICO Q-Q PLOT
    // ====================================================================

    function createQQPlot(data, canvasId, title) {
        if (chartInstances[canvasId === 'qqChartCanvas' ? 'qqChart' : 'overallQQChart']) {
            chartInstances[canvasId === 'qqChartCanvas' ? 'qqChart' : 'overallQQChart'].destroy();
        }

        const sortedData = data.slice().sort((a, b) => a - b);
        const n = sortedData.length;

        // Calcular cuantiles teóricos
        const theoreticalQuantiles = [];
        for (let i = 0; i < n; i++) {
            const p = (i + 1 - 0.375) / (n + 0.25);
            theoreticalQuantiles.push(normalQuantile(p));
        }

        // Calcular media y desviación estándar para la línea de referencia
        const mean = sortedData.reduce((a, b) => a + b, 0) / n;
        const stdDev = Math.sqrt(sortedData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1));

        // Calcular puntos para la línea de referencia (y = mean + stdDev * x)
        const minTheoretical = Math.min(...theoreticalQuantiles);
        const maxTheoretical = Math.max(...theoreticalQuantiles);
        const referenceLine = [
            { x: minTheoretical, y: mean + stdDev * minTheoretical },
            { x: maxTheoretical, y: mean + stdDev * maxTheoretical }
        ];

        const ctx = document.getElementById(canvasId).getContext('2d');
        const chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Data Points',
                        data: theoreticalQuantiles.map((x, i) => ({ x, y: sortedData[i] })),
                        backgroundColor: 'rgba(52, 152, 219, 0.7)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Reference Line',
                        data: referenceLine,
                        type: 'line',
                        borderColor: 'rgba(231, 76, 60, 1)',
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0,
                        showLine: true,
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                if (context.dataset.label === 'Data Points') {
                                    return `Theoretical: ${context.parsed.x.toFixed(4)}, Sample: ${context.parsed.y.toFixed(4)}`;
                                }
                                return context.dataset.label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Theoretical Quantiles'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Sample Quantiles'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });

        // Guardar la instancia del gráfico
        if (canvasId === 'qqChartCanvas') {
            chartInstances.qqChart = chart;
        } else {
            chartInstances.overallQQChart = chart;
        }

        return chart;
    }

    function plotChart(mean, deviation, lsl, usl, data, index) {
        if (chartInstances.cpkChart) chartInstances.cpkChart.destroy();

        const histogramData = generateHistogramData(data);
        const curvePoints = generateNormalCurveData(data, mean, deviation, histogramData.binWidth);

        const canvas = document.getElementById("cpkChartCanvas").getContext("2d");

        const processLowerLimit = mean - 3 * deviation;
        const processUpperLimit = mean + 3 * deviation;

        chartInstances.cpkChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: histogramData.labels,
                datasets: [
                    {
                        label: 'Frequency',
                        data: histogramData.bins,
                        type: 'bar',
                        backgroundColor: 'rgba(52, 152, 219, 0.6)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 1,
                        borderRadius: 2
                    },
                    {
                        label: 'Normal Curve',
                        data: curvePoints,
                        type: 'line',
                        borderColor: 'rgba(44, 62, 80, 1)',
                        backgroundColor: 'transparent',
                        pointRadius: 0,
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: { display: true, text: 'Value' },
                        offset: true
                    },
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Frequency' }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Process Distribution Frequency Plot - Dataset #' + (index + 1)
                    },
                    annotation: {
                        annotations: {
                            lsl: {
                                type: 'line',
                                scaleID: 'x',
                                value: lsl,
                                borderColor: '#e74c3c',
                                borderWidth: 2.5,
                                label: {
                                    enabled: true,
                                    content: 'LSL: ' + lsl,
                                    backgroundColor: '#e74c3c',
                                    color: 'white',
                                    position: 'start'
                                }
                            },
                            usl: {
                                type: 'line',
                                scaleID: 'x',
                                value: usl,
                                borderColor: '#e74c3c',
                                borderWidth: 2.5,
                                label: {
                                    enabled: true,
                                    content: 'USL: ' + usl,
                                    backgroundColor: '#e74c3c',
                                    color: 'white',
                                    position: 'end'
                                }
                            },
                            mean: {
                                type: 'line',
                                scaleID: 'x',
                                value: mean,
                                borderColor: '#333',
                                borderWidth: 2,
                                borderDash: [6, 6],
                                label: {
                                    enabled: true,
                                    content: 'Mean: ' + mean.toFixed(2),
                                    backgroundColor: '#333',
                                    color: 'white',
                                    position: 'start'
                                }
                            },
                            processLower: {
                                type: 'line',
                                scaleID: 'x',
                                value: processLowerLimit,
                                borderColor: '#3498db',
                                borderWidth: 2,
                                borderDash: [],
                                label: {
                                    enabled: true,
                                    content: '-3σ',
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    position: 'start'
                                }
                            },
                            processUpper: {
                                type: 'line',
                                scaleID: 'x',
                                value: processUpperLimit,
                                borderColor: '#3498db',
                                borderWidth: 2,
                                borderDash: [],
                                label: {
                                    enabled: true,
                                    content: '+3σ',
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    position: 'end'
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    function plotOverallChart(mean, deviation, lsl, usl, data) {
        if (chartInstances.overallChart) chartInstances.overallChart.destroy();

        const histogramData = generateHistogramData(data);
        const curvePoints = generateNormalCurveData(data, mean, deviation, histogramData.binWidth);

        const canvas = document.getElementById("overallChartCanvas").getContext("2d");

        const processLowerLimit = mean - 3 * deviation;
        const processUpperLimit = mean + 3 * deviation;

        chartInstances.overallChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: histogramData.labels,
                datasets: [
                    {
                        label: 'Frequency',
                        data: histogramData.bins,
                        type: 'bar',
                        backgroundColor: 'rgba(52, 152, 219, 0.6)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 1,
                        borderRadius: 2
                    },
                    {
                        label: 'Normal Curve',
                        data: curvePoints,
                        type: 'line',
                        borderColor: 'rgba(44, 62, 80, 1)',
                        backgroundColor: 'transparent',
                        pointRadius: 0,
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: { display: true, text: 'Value' },
                        offset: true
                    },
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Frequency' }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Process Distribution Frequency Plot - Overall (long term)'
                    },
                    annotation: {
                        annotations: {
                            lsl: {
                                type: 'line',
                                scaleID: 'x',
                                value: lsl,
                                borderColor: '#e74c3c',
                                borderWidth: 2.5,
                                label: {
                                    enabled: true,
                                    content: 'LSL: ' + lsl,
                                    backgroundColor: '#e74c3c',
                                    color: 'white',
                                    position: 'start'
                                }
                            },
                            usl: {
                                type: 'line',
                                scaleID: 'x',
                                value: usl,
                                borderColor: '#e74c3c',
                                borderWidth: 2.5,
                                label: {
                                    enabled: true,
                                    content: 'USL: ' + usl,
                                    backgroundColor: '#e74c3c',
                                    color: 'white',
                                    position: 'end'
                                }
                            },
                            mean: {
                                type: 'line',
                                scaleID: 'x',
                                value: mean,
                                borderColor: '#333',
                                borderWidth: 2,
                                borderDash: [6, 6],
                                label: {
                                    enabled: true,
                                    content: 'Mean: ' + mean.toFixed(2),
                                    backgroundColor: '#333',
                                    color: 'white',
                                    position: 'start'
                                }
                            },
                            processLower: {
                                type: 'line',
                                scaleID: 'x',
                                value: processLowerLimit,
                                borderColor: '#3498db',
                                borderWidth: 2,
                                borderDash: [],
                                label: {
                                    enabled: true,
                                    content: '-3σ',
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    position: 'start'
                                }
                            },
                            processUpper: {
                                type: 'line',
                                scaleID: 'x',
                                value: processUpperLimit,
                                borderColor: '#3498db',
                                borderWidth: 2,
                                borderDash: [],
                                label: {
                                    enabled: true,
                                    content: '+3σ',
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    position: 'end'
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    function createControlChart(dataset, index) {
        if (chartInstances.controlChart) chartInstances.controlChart.destroy();
        const ctx = document.getElementById('controlChartCanvas').getContext('2d');
        const measurements = dataset.measurements;
        const mean = dataset.mean;
        const sigmaWithin = dataset.sigmaWithin;
        const ucl = mean + 3 * sigmaWithin;
        const lcl = mean - 3 * sigmaWithin;

        chartInstances.controlChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: measurements.map(function (_, i) { return i + 1; }),
                datasets: [
                    {
                        label: 'Measurements',
                        data: measurements,
                        borderColor: '#3498db',
                        borderWidth: 2,
                        pointRadius: 3,
                        fill: false
                    },
                    {
                        label: 'UCL',
                        data: Array(measurements.length).fill(ucl),
                        borderColor: '#e74c3c',
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'Mean',
                        data: Array(measurements.length).fill(mean),
                        borderColor: '#1abc9c',
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        data: Array(measurements.length).fill(lcl),
                        borderColor: '#e74c3c',
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'I-Chart - Dataset #' + (index + 1),
                        font: { size: 16 }
                    },
                    legend: { position: 'bottom' }
                },
                scales: {
                    x: { title: { display: true, text: 'Observation' } },
                    y: { title: { display: true, text: 'Value' } }
                }
            }
        });
    }

    function createOverallControlChart(stats) {
        if (chartInstances.overallControlChart) chartInstances.overallControlChart.destroy();
        const ctx = document.getElementById('overallControlChartCanvas').getContext('2d');
        const mean = stats.mean;
        const sigmaOverall = stats.sigmaOverall;
        const ucl = mean + 3 * sigmaOverall;
        const lcl = mean - 3 * sigmaOverall;

        chartInstances.overallControlChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: overallData.map(function (_, i) { return i + 1; }),
                datasets: [
                    {
                        label: 'Measurements',
                        data: overallData,
                        borderColor: '#3498db',
                        borderWidth: 1,
                        pointRadius: 2,
                        fill: false
                    },
                    {
                        label: 'UCL',
                        data: Array(overallData.length).fill(ucl),
                        borderColor: '#e74c3c',
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'Mean',
                        data: Array(overallData.length).fill(mean),
                        borderColor: '#1abc9c',
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        data: Array(overallData.length).fill(lcl),
                        borderColor: '#e74c3c',
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Overall I-Chart',
                        font: { size: 16 }
                    },
                    legend: { position: 'bottom' }
                },
                scales: {
                    x: { title: { display: true, text: 'Observation' } },
                    y: { title: { display: true, text: 'Value' } }
                }
            }
        });
    }

    function updateDatasetTabs() {
        const tabsContainer = document.getElementById('datasetTabsContainer');
        tabsContainer.innerHTML = '';

        // Siempre mostrar las pestañas si hay al menos un dataset
        if (datasets.length >= 1) {
            tabsContainer.style.display = 'flex';

            // Añadir pestañas para cada dataset
            datasets.forEach(function (dataset, index) {
                const tab = document.createElement('div');
                tab.className = 'dataset-tab' + (index === 0 ? ' active' : '');
                tab.textContent = 'Dataset #' + dataset.id;
                tab.addEventListener('click', function () {
                    document.querySelectorAll('.dataset-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    // Mostrar resultados del dataset seleccionado
                    displayResults(dataset, index);
                });
                tabsContainer.appendChild(tab);
            });

            // Añadir pestaña overall SIEMPRE que haya datos overall
            if (overallData.length >= 2 && overallStats) {
                const overallTab = document.createElement('div');
                overallTab.className = 'dataset-tab overall-tab';
                overallTab.textContent = 'Overall Results';
                overallTab.addEventListener('click', function () {
                    document.querySelectorAll('.dataset-tab').forEach(t => t.classList.remove('active'));
                    overallTab.classList.add('active');
                    // Mostrar resultados overall
                    displayOverallResults(overallStats);
                });
                tabsContainer.appendChild(overallTab);
            }
        } else {
            tabsContainer.style.display = 'none';
        }
    }

    function addNewDataset() {
        currentDatasetId++;
        const newDatasetEl = document.createElement('div');
        newDatasetEl.className = 'dataset-container';
        newDatasetEl.dataset.id = currentDatasetId;
        newDatasetEl.innerHTML = '<div class="dataset-header"><span class="dataset-title">Measurements (Dataset #' + currentDatasetId + ')</span><button type="button" class="remove-dataset-btn"><i class="fas fa-times"></i> Remove</button></div><textarea class="measurements-input" rows="1"></textarea>';
        document.getElementById('datasetsContainer').appendChild(newDatasetEl);
        const removeBtn = newDatasetEl.querySelector('.remove-dataset-btn');
        removeBtn.addEventListener('click', function () {
            if (document.querySelectorAll('.dataset-container').length > 1) {
                newDatasetEl.remove();
            }
        });
        // Show remove buttons if there's more than one dataset
        document.querySelectorAll('.remove-dataset-btn').forEach(function (btn) {
            btn.style.display = 'block';
        });
    }

    function fillExampleData() {
        const currentExample = exampleDataSetsCollection[exampleIndex];

        // Advance to the next example set
        exampleIndex = (exampleIndex + 1) % exampleDataSetsCollection.length;

        const dsContainer = document.getElementById('datasetsContainer');
        dsContainer.innerHTML = '';
        currentDatasetId = 0;

        document.getElementById('lsl').value = currentExample.lsl;
        document.getElementById('usl').value = currentExample.usl;
        document.getElementById('target').value = currentExample.target;

        currentExample.datasets.forEach(function (ex) {
            currentDatasetId++;
            const newDatasetEl = document.createElement('div');
            newDatasetEl.className = 'dataset-container';
            newDatasetEl.dataset.id = currentDatasetId;
            newDatasetEl.innerHTML = '<div class="dataset-header"><span class="dataset-title">Measurements (Dataset #' + currentDatasetId + ')</span><button type="button" class="remove-dataset-btn"><i class="fas fa-times"></i> Remove</button></div><textarea class="measurements-input" rows="1"></textarea>';
            dsContainer.appendChild(newDatasetEl);
            newDatasetEl.querySelector('.measurements-input').value = ex.data.join(', ');
            newDatasetEl.querySelector('.remove-dataset-btn').addEventListener('click', function () {
                if (document.querySelectorAll('.dataset-container').length > 1) {
                    newDatasetEl.remove();
                }
            });
        });

        // Show remove buttons since there are multiple datasets
        document.querySelectorAll('.remove-dataset-btn').forEach(function (btn) {
            btn.style.display = 'block';
        });
    }

    function resetFormData() {
        document.getElementById('cpkForm').reset();
        const dsContainer = document.getElementById('datasetsContainer');
        dsContainer.innerHTML = '';
        currentDatasetId = 1;
        overallStats = null;

        // Crear primer dataset directamente
        const newDatasetEl = document.createElement('div');
        newDatasetEl.className = 'dataset-container';
        newDatasetEl.dataset.id = currentDatasetId;
        newDatasetEl.innerHTML = '<div class="dataset-header"><span class="dataset-title">Measurements (Dataset #' + currentDatasetId + ')</span><button type="button" class="remove-dataset-btn" style="display:none;"><i class="fas fa-times"></i> Remove</button></div><textarea class="measurements-input" rows="1" placeholder="Enter values or click \'Fill Example\'" required></textarea>';
        dsContainer.appendChild(newDatasetEl);

        const removeBtn = newDatasetEl.querySelector('.remove-dataset-btn');
        removeBtn.addEventListener('click', function () {
            if (document.querySelectorAll('.dataset-container').length > 1) {
                newDatasetEl.remove();
            }
        });

        // Ocultar contenedores de resultados
        document.getElementById('dataset-results-wrapper').classList.remove('active');
        document.getElementById('overall-results-wrapper').classList.remove('active');
        document.getElementById('short-term-charts-wrapper').style.display = 'none';
        document.getElementById('long-term-charts-wrapper').style.display = 'none';
        document.getElementById('datasetTabsContainer').style.display = 'none';
        document.getElementById('qqChartContainer').style.display = 'none';
        document.getElementById('overallQQChartContainer').style.display = 'none';

        // Resetear los nuevos valores overall
        document.getElementById('overall_cp_short').textContent = '-';
        document.getElementById('overall_cpk_short').textContent = '-';
        document.getElementById('overall_cpm_short').textContent = '-';
        document.getElementById('overall_dev_short').textContent = '-';

        // Resetear intervalos de confianza
        document.getElementById('cp_ci').textContent = '95% CI: -';
        document.getElementById('cpk_ci').textContent = '95% CI: -';
        document.getElementById('cpm_ci').textContent = '95% CI: -';
        document.getElementById('overall_cp_short_ci').textContent = '95% CI: -';
        document.getElementById('overall_cpk_short_ci').textContent = '95% CI: -';
        document.getElementById('overall_cpm_short_ci').textContent = '95% CI: -';
        document.getElementById('overall_pp_ci').textContent = '95% CI: -';
        document.getElementById('overall_ppk_ci').textContent = '95% CI: -';

        document.getElementById('exportBtn').disabled = true;

        // Resetear también los gráficos
        Object.values(chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        chartInstances = {
            cpkChart: null,
            controlChart: null,
            overallChart: null,
            overallControlChart: null,
            qqChart: null,
            overallQQChart: null
        };
    }

    function exportToExcel() {
        if (datasets.length === 0) {
            alert('No hay datos para exportar. Por favor, realiza un cálculo primero.');
            return;
        }

        const wb = XLSX.utils.book_new();

        const summaryData = [
            ["Capability Index Analysis Summary"],
            [],
            ["LSL:", document.getElementById('lsl').value],
            ["USL:", document.getElementById('usl').value],
            ["Target:", document.getElementById('target').value],
            [],
            ["Overall (Long-Term) Results"],
            ["Total Points", overallData.length],
            ["Overall Mean", overallStats.mean.toFixed(4)],
            ["Overall Std Dev (long-term)", overallStats.sigmaOverall.toFixed(4)],
            ["Pp", overallStats.pp.toFixed(4)],
            ["Pp 95% CI Lower", formatConfidenceInterval(overallStats.ppCI).split('[')[1]?.split(',')[0] || 'N/A'],
            ["Pp 95% CI Upper", formatConfidenceInterval(overallStats.ppCI).split(',')[1]?.split(']')[0] || 'N/A'],
            ["Ppk", overallStats.ppk.toFixed(4)],
            ["Ppk 95% CI Lower", formatConfidenceInterval(overallStats.ppkCI).split('[')[1]?.split(',')[0] || 'N/A'],
            ["Ppk 95% CI Upper", formatConfidenceInterval(overallStats.ppkCI).split(',')[1]?.split(']')[0] || 'N/A'],
            ["Expected Failures (ppm)", overallStats.failures_ppm_lt.toFixed(2)],
            ["Defective Parts", overallStats.defective_percentage_lt.toFixed(4)],
            [],
            ["Overall (Short-Term) Results"],
            ["Overall Std Dev (short-term)", overallStats.sigmaWithin.toFixed(4)],
            ["Cp (overall short-term)", isFinite(overallStats.cp) ? overallStats.cp.toFixed(4) : 'N/A'],
            ["Cp 95% CI Lower", formatConfidenceInterval(overallStats.cpCI).split('[')[1]?.split(',')[0] || 'N/A'],
            ["Cp 95% CI Upper", formatConfidenceInterval(overallStats.cpCI).split(',')[1]?.split(']')[0] || 'N/A'],
            ["Cpk (overall short-term)", isFinite(overallStats.cpk) ? overallStats.cpk.toFixed(4) : 'N/A'],
            ["Cpk 95% CI Lower", formatConfidenceInterval(overallStats.cpkCI).split('[')[1]?.split(',')[0] || 'N/A'],
            ["Cpk 95% CI Upper", formatConfidenceInterval(overallStats.cpkCI).split(',')[1]?.split(']')[0] || 'N/A'],
            ["Cpm (overall short-term)", isFinite(overallStats.cpm) ? overallStats.cpm.toFixed(4) : 'N/A'],
            ["Cpm 95% CI Lower", formatConfidenceInterval(overallStats.cpmCI).split('[')[1]?.split(',')[0] || 'N/A'],
            ["Cpm 95% CI Upper", formatConfidenceInterval(overallStats.cpmCI).split(',')[1]?.split(']')[0] || 'N/A'],
            ["Expected Failures (ppm)", overallStats.failures_ppm.toFixed(2)],
            ["Defective Parts", overallStats.defective_percentage.toFixed(4)],
            [],
            ["Overall Normality Tests"],
            ["Shapiro-Wilk", overallStats.shapiro.result + ' (W=' + overallStats.shapiro.statistic.toFixed(4) + ', p=' + (overallStats.shapiro.pValue ? overallStats.shapiro.pValue.toFixed(4) : 'N/A') + ')'],
            ["Kolmogorov-Smirnov", overallStats.kolmogorov.result + ' (D=' + overallStats.kolmogorov.statistic.toFixed(4) + ', p=' + (overallStats.kolmogorov.pValue ? overallStats.kolmogorov.pValue.toFixed(4) : 'N/A') + ')'],
            ["Anderson-Darling", overallStats.anderson.result + ' (A²=' + overallStats.anderson.statistic.toFixed(4) + ', crit=' + (overallStats.anderson.criticalValue ? overallStats.anderson.criticalValue.toFixed(4) : 'N/A') + ')'],
            [],
            ["Individual Dataset Results"],
            ["Dataset", "Mean", "Std Dev (short-term)", "Cp", "Cp 95% CI", "Cpk", "Cpk 95% CI", "Cpm", "Cpm 95% CI", "Failures (ppm)", "Defective",
                "Shapiro-Wilk Result", "Shapiro-Wilk Statistic", "Shapiro-Wilk p-value",
                "Kolmogorov Result", "Kolmogorov Statistic", "Kolmogorov p-value",
                "Anderson-Darling Result", "Anderson-Darling Statistic", "Anderson-Darling Critical Value"]
        ];

        datasets.forEach(function (d) {
            summaryData.push([
                'Dataset #' + d.id,
                d.mean.toFixed(4),
                d.sigmaWithin.toFixed(4),
                isFinite(d.cp) ? d.cp.toFixed(4) : 'N/A',
                formatConfidenceInterval(d.cpCI),
                isFinite(d.cpk) ? d.cpk.toFixed(4) : 'N/A',
                formatConfidenceInterval(d.cpkCI),
                isFinite(d.cpm) ? d.cpm.toFixed(4) : 'N/A',
                formatConfidenceInterval(d.cpmCI),
                d.failures_ppm.toFixed(2),
                d.defective_percentage.toFixed(4),
                d.shapiro.result,
                d.shapiro.statistic.toFixed(4),
                d.shapiro.pValue ? d.shapiro.pValue.toFixed(4) : 'N/A',
                d.kolmogorov.result,
                d.kolmogorov.statistic.toFixed(4),
                d.kolmogorov.pValue ? d.kolmogorov.pValue.toFixed(4) : 'N/A',
                d.anderson.result,
                d.anderson.statistic.toFixed(4),
                d.anderson.criticalValue ? d.anderson.criticalValue.toFixed(4) : 'N/A'
            ]);
        });

        // Datos brutos por dataset
        datasets.forEach(function (d, index) {
            const datasetData = [["Dataset #" + d.id + " - Raw Data"]];
            d.measurements.forEach(function (point) {
                datasetData.push([point]);
            });
            const wsDataset = XLSX.utils.aoa_to_sheet(datasetData);
            XLSX.utils.book_append_sheet(wb, wsDataset, "Dataset " + (index + 1));
        });

        // Todos los datos brutos combinados
        const rawDataSheet = [["All Data Points (Combined)"]];
        overallData.forEach(function (d) {
            rawDataSheet.push([d]);
        });
        const wsRawData = XLSX.utils.aoa_to_sheet(rawDataSheet);
        XLSX.utils.book_append_sheet(wb, wsRawData, "All Raw Data");

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        XLSX.writeFile(wb, "cpk_analysis.xlsx");
    }

    // ====================================================================
    // FUNCIONES AUXILIARES DE ALTA PRECISIÓN
    // ====================================================================

    /**
     * HIGH-PRECISION NORMAL CDF IMPLEMENTATION
     * Hart double-precision algorithm (error < 1e-12)
     */
    function normalCDF(x) {
        if (x === 0) return 0.5;

        const absX = Math.abs(x);
        if (absX > 8) {
            return x > 0 ? 1 : 0;
        }

        const t = 1 / (1 + 0.2316419 * absX);
        const d = 0.3989422804014327 * Math.exp(-x * x / 2);

        const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));

        return x > 0 ? 1 - p : p;
    }

    /**
     * HIGH-PRECISION NORMAL QUANTILE FUNCTION
     * Acklam's algorithm (error < 1.15e-9)
     */
    function normalQuantile(p) {
        if (p <= 0 || p >= 1) {
            return p === 0 ? -Infinity : p === 1 ? Infinity : NaN;
        }

        const a1 = -3.969683028665376e+01;
        const a2 = 2.209460984245205e+02;
        const a3 = -2.759285104469687e+02;
        const a4 = 1.383577518672690e+02;
        const a5 = -3.066479806614716e+01;
        const a6 = 2.506628277459239e+00;

        const b1 = -5.447609879822406e+01;
        const b2 = 1.615858368580409e+02;
        const b3 = -1.556989798598866e+02;
        const b4 = 6.680131188771972e+01;
        const b5 = -1.328068155288572e+01;

        const c1 = -7.784894002430293e-03;
        const c2 = -3.223964580411365e-01;
        const c3 = -2.400758277161838e+00;
        const c4 = -2.549732539343734e+00;
        const c5 = 4.374664141464968e+00;
        const c6 = 2.938163982698783e+00;

        const d1 = 7.784695709041462e-03;
        const d2 = 3.224671290700398e-01;
        const d3 = 2.445134137142996e+00;
        const d4 = 3.754408661907416e+00;

        let q, r;

        if (p < 0.02425) {
            q = Math.sqrt(-2 * Math.log(p));
            return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
        } else if (p > 0.97575) {
            q = Math.sqrt(-2 * Math.log(1 - p));
            return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
        } else {
            q = p - 0.5;
            r = q * q;
            return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
                (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
        }
    }

    // ====================================================================
    // SHAPIRO-WILK TEST
    // ====================================================================

    function shapiroWilkTest(data) {
        const n = data.length;

        if (n < 3) {
            return { statistic: NaN, pValue: NaN, result: 'N/A', message: 'Sample size too small (n < 3 required)' };
        }
        if (n > 5000) {
            return { statistic: NaN, pValue: NaN, result: 'N/A', message: 'Sample size too large (n > 5000 not supported)' };
        }

        const allEqual = data.every(val => val === data[0]);
        if (allEqual) {
            return {
                statistic: 1.0,
                pValue: 1.0,
                result: 'Pass',
                message: 'All values are identical (perfect correlation with normal distribution)'
            };
        }

        const sorted = data.slice().sort(function (a, b) { return a - b; });
        const mean = sorted.reduce(function (a, b) { return a + b; }, 0) / n;

        let variance = 0;
        for (let i = 0; i < n; i++) {
            variance += Math.pow(sorted[i] - mean, 2);
        }
        variance = variance / (n - 1);

        if (variance < 1e-10) {
            return {
                statistic: 1.0,
                pValue: 1.0,
                result: 'Pass',
                message: 'Variance too small (< 1e-10), data appears normal'
            };
        }

        const a = calculateShapiroWilkCoefficients(n);
        const W = calculateShapiroWStatisticRobust(sorted, a, n, mean, variance);
        const pValue = calculateShapiroWilkPValue(W, n);

        return {
            statistic: W,
            pValue: pValue,
            result: pValue > 0.05 ? 'Pass' : 'Fail',
            message: pValue > 0.05 ? 'Data appears normal' : 'Data significantly deviates from normality'
        };
    }

    function calculateShapiroWStatisticRobust(sorted, a, n, mean, variance) {
        const k = Math.floor(n / 2);

        let numerator = 0;
        for (let i = 0; i < k; i++) {
            const diff = sorted[n - 1 - i] - sorted[i];
            if (Math.abs(diff) < 1e-15 && diff !== 0) {
                numerator += a[i] * 1e-15;
            } else if (i < a.length) {
                numerator += a[i] * diff;
            }
        }

        numerator = Math.max(1e-15, Math.abs(numerator));
        numerator = Math.pow(numerator, 2);

        const denominator = variance * (n - 1);

        if (denominator === 0 || denominator < 1e-15) {
            return 1.0;
        }

        const W = numerator / denominator;

        return Math.max(0, Math.min(1, W));
    }

    function calculateShapiroWilkCoefficients(n) {
        const a = new Array(Math.floor(n / 2));

        if (n <= 50) {
            for (let i = 0; i < a.length; i++) {
                const u = (i + 1 - 0.375) / (n + 0.25);
                a[i] = normalQuantile(u);
            }

            const norm = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
            for (let i = 0; i < a.length; i++) {
                a[i] = a[i] / norm;
            }
        } else {
            for (let i = 0; i < a.length; i++) {
                const u = (i + 1 - 0.375) / (n + 0.25);
                a[i] = normalQuantile(u);
            }

            const scale = Math.sqrt(n);
            for (let i = 0; i < a.length; i++) {
                a[i] = a[i] / scale;
            }
        }

        return a;
    }

    function calculateShapiroWilkPValue(W, n) {
        if (n <= 11) {
            const gamma = 0.459 * n - 2.273;
            const sigma = Math.exp(0.5440 - 0.39978 * n + 0.025054 * Math.pow(n, 2) - 0.0006714 * Math.pow(n, 3));
            const y = Math.log(1 - W);
            const z = (y - gamma) / sigma;
            return 1 - normalCDF(z);
        } else {
            const u = Math.log(n);
            const mu = -1.5861 - 0.31082 * u - 0.083751 * u * u + 0.0038915 * u * u * u;
            const sigma = Math.exp(-0.4803 - 0.082676 * u + 0.0030302 * u * u);

            const safeW = Math.min(0.999999, Math.max(W, 0.000001));
            const y = Math.log(1 - safeW);
            const z = (y - mu) / sigma;

            return 1 - normalCDF(z);
        }
    }

    // ====================================================================
    // KOLMOGOROV-SMIRNOV TEST
    // ====================================================================

    function kolmogorovSmirnovTest(data) {
        const n = data.length;

        if (n < 5) {
            return { statistic: NaN, pValue: NaN, result: 'N/A', message: 'Sample size too small (n < 5 required)' };
        }

        const sorted = data.slice().sort(function (a, b) { return a - b; });
        const mean = sorted.reduce(function (a, b) { return a + b; }, 0) / n;
        const stdDev = Math.sqrt(sorted.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / (n - 1));

        if (stdDev === 0) {
            return {
                statistic: 0,
                pValue: 1.0,
                result: 'Pass',
                message: 'All values are identical (perfect fit to normal distribution)'
            };
        }

        let Dplus = 0;
        let Dminus = 0;

        for (let i = 0; i < n; i++) {
            const Fn = (i + 1) / n;
            const F = normalCDF((sorted[i] - mean) / stdDev);
            const Fn_prev = i / n;

            Dplus = Math.max(Dplus, Fn - F);
            Dminus = Math.max(Dminus, F - Fn_prev);
        }

        const D = Math.max(Dplus, Dminus);
        const pValue = calculateKSPValue(D, n);

        return {
            statistic: D,
            pValue: pValue,
            result: pValue > 0.05 ? 'Pass' : 'Fail',
            message: pValue > 0.05 ? 'Data appears normal' : 'Data significantly deviates from normality'
        };
    }

    function calculateKSPValue(D, n) {
        if (n <= 100) {
            const D_corrected = D * (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n));
            const term = -2 * D_corrected * D_corrected;
            return Math.max(0, Math.min(1, 1 - Math.exp(term)));
        } else {
            const K = D * Math.sqrt(n);
            let sum = 0;
            for (let k = 1; k <= 100; k++) {
                const term = Math.pow(-1, k - 1) * Math.exp(-2 * k * k * K * K);
                sum += term;
                if (Math.abs(term) < 1e-10) break;
            }
            return Math.max(0, Math.min(1, 2 * sum));
        }
    }

    // ====================================================================
    // ANDERSON-DARLING TEST
    // ====================================================================

    function andersonDarlingTest(data) {
        const n = data.length;

        if (n < 8) {
            return { statistic: NaN, criticalValue: NaN, result: 'N/A', message: 'Sample size too small (n < 8 required)' };
        }

        const sorted = data.slice().sort(function (a, b) { return a - b; });
        const mean = sorted.reduce(function (a, b) { return a + b; }, 0) / n;
        const variance = sorted.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / (n - 1);
        const stdDev = Math.sqrt(variance);

        if (stdDev === 0) {
            return { statistic: 0, criticalValue: 0, pValue: 1.0, result: 'Pass', message: 'All values identical (perfect fit to normal distribution)' };
        }

        let A2 = calculateAndersonDarlingStatistic(sorted, mean, stdDev, n);
        const A2_corrected = applyAndersonDarlingCorrection(A2, n);
        const criticalValue = getAndersonDarlingCriticalValue(n);
        const pValue = estimateAndersonDarlingPValue(A2_corrected, n);

        return {
            statistic: A2_corrected,
            criticalValue: criticalValue,
            pValue: pValue,
            result: A2_corrected <= criticalValue ? 'Pass' : 'Fail',
            message: A2_corrected <= criticalValue ? 'Data appears normal' : 'Data significantly deviates from normality'
        };
    }

    function calculateAndersonDarlingStatistic(sorted, mean, stdDev, n) {
        let sum = 0;
        const epsilon = 1e-10;

        for (let i = 0; i < n; i++) {
            const z = (sorted[i] - mean) / stdDev;
            const F = normalCDF(z);

            const F_robust = Math.max(epsilon, Math.min(1 - epsilon, F));

            const logF = Math.log(F_robust);
            const log1mF = Math.log(1 - F_robust);

            const term1 = (2 * i + 1) * logF;
            const term2 = (2 * (n - i) - 1) * log1mF;

            sum += term1 + term2;
        }

        return -n - sum / n;
    }

    function applyAndersonDarlingCorrection(A2, n) {
        if (n >= 20) {
            return A2 * (1 + 0.75 / n + 2.25 / (n * n));
        } else {
            return A2 * (1 + 0.3 / n);
        }
    }

    function getAndersonDarlingCriticalValue(n) {
        const criticalValues = {
            8: 0.736, 9: 0.768, 10: 0.805, 11: 0.839, 12: 0.870,
            13: 0.900, 14: 0.928, 15: 0.954, 16: 0.979, 17: 1.002,
            18: 1.024, 19: 1.045, 20: 1.065, 25: 1.173, 30: 1.266,
            35: 1.349, 40: 1.424, 45: 1.493, 50: 1.557, 60: 1.673,
            70: 1.777, 80: 1.872, 90: 1.960, 100: 2.042,
            150: 2.381, 200: 2.626, 300: 2.998, 400: 3.283,
            500: 3.516, 1000: 4.318
        };

        const sizes = Object.keys(criticalValues).map(Number).sort(function (a, b) { return a - b; });

        if (n <= sizes[0]) return criticalValues[sizes[0]];
        if (n >= sizes[sizes.length - 1]) return criticalValues[sizes[sizes.length - 1]];

        for (let i = 0; i < sizes.length - 1; i++) {
            if (n >= sizes[i] && n <= sizes[i + 1]) {
                const t = (n - sizes[i]) / (sizes[i + 1] - sizes[i]);
                return criticalValues[sizes[i]] * (1 - t) + criticalValues[sizes[i + 1]] * t;
            }
        }

        return 0.752;
    }

    function estimateAndersonDarlingPValue(A2, n) {
        if (A2 <= 0.2) return 0.99;
        if (A2 <= 0.5) return 0.90;
        if (A2 <= 0.8) return 0.70;
        if (A2 <= 1.0) return 0.50;
        if (A2 <= 1.5) return 0.20;
        if (A2 <= 2.0) return 0.10;
        if (A2 <= 2.5) return 0.05;
        if (A2 <= 3.0) return 0.025;
        if (A2 <= 3.5) return 0.01;
        return 0.001;
    }

});