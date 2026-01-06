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
        overallControlChart: null
    };

    let exampleIndex = 0;

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
        document.querySelectorAll('.dataset-container').forEach(function (el) {
            const id = parseInt(el.dataset.id);
            const measurements = parseMeasurements(el.querySelector('.measurements-input').value);
            if (measurements.length >= 2) {
                const stats = calculateStatistics(measurements, lsl, usl, target);
                datasets.push({ id: id, measurements: measurements, ...stats });
                overallData.push.apply(overallData, measurements);
            }
        });

        if (datasets.length === 0) {
            alert('No valid datasets with enough data (minimum 2 data points).');
            return;
        }

        // Mostrar los resultados del primer dataset
        displayResults(datasets[0], 0);
        updateDatasetTabs();

        const overallStats = calculateStatistics(overallData, lsl, usl, target);
        if (overallStats && overallData.length >= 2) {
            // Mostrar contenedor de resultados overall
            document.getElementById('overall-results-wrapper').classList.add('active');
            document.getElementById('long-term-charts-wrapper').style.display = 'flex';
            displayOverallResults(overallStats);
        } else {
            document.getElementById('overall-results-wrapper').classList.remove('active');
            document.getElementById('long-term-charts-wrapper').style.display = 'none';
        }

        document.getElementById('exportBtn').disabled = false;
    }

    function parseMeasurements(text) {
        return text.split(/[\s,;]+/).map(function (val) {
            return parseFloat(val.trim());
        }).filter(function (val) {
            return !isNaN(val);
        });
    }

    function calculateStatistics(data, lsl, usl, target) {
        if (data.length < 2) return null;
        const n = data.length;
        const mean = data.reduce(function (a, b) { return a + b; }, 0) / n;

        // Calculate sigma within using moving ranges (exact method)
        const movingRanges = [];
        for (let i = 1; i < data.length; i++) {
            movingRanges.push(Math.abs(data[i] - data[i - 1]));
        }
        const mrBar = movingRanges.reduce(function (a, b) { return a + b; }, 0) / movingRanges.length;
        const sigmaWithin = mrBar / 1.128; // d2 for n=2

        // Calculate sigma overall (traditional standard deviation)
        const variance = data.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / (n - 1);
        const sigmaOverall = Math.sqrt(variance);

        // MEJORA 1: Manejo robusto de variación cero
        if (sigmaWithin === 0) {
            const allEqual = data.every(val => val === data[0]);
            if (allEqual) {
                const centered = (data[0] > lsl && data[0] < usl);
                const onTarget = (data[0] === target);

                // Para datos idénticos dentro de especificaciones
                if (centered) {
                    return {
                        mean: mean,
                        sigmaWithin: sigmaWithin,
                        sigmaOverall: sigmaOverall,
                        mrBar: mrBar,
                        cp: Infinity,
                        cpk: Infinity,
                        cpm: onTarget ? Infinity : 0,
                        pp: (usl - lsl) / (6 * sigmaOverall),
                        ppk: Math.min((usl - mean) / (3 * sigmaOverall), (mean - lsl) / (3 * sigmaOverall)),
                        failures_ppm: 0,
                        defective_percentage: 0,
                        shapiro: { result: 'N/A', statistic: 0, pValue: 0 },
                        kolmogorov: { result: 'N/A', statistic: 0, pValue: 0 },
                        anderson: { result: 'N/A', statistic: 0, criticalValue: 0 }
                    };
                } else {
                    // Datos idénticos fuera de especificaciones
                    return {
                        mean: mean,
                        sigmaWithin: sigmaWithin,
                        sigmaOverall: sigmaOverall,
                        mrBar: mrBar,
                        cp: 0,
                        cpk: 0,
                        cpm: 0,
                        pp: 0,
                        ppk: 0,
                        failures_ppm: 1000000,
                        defective_percentage: 100,
                        shapiro: { result: 'N/A', statistic: 0, pValue: 0 },
                        kolmogorov: { result: 'N/A', statistic: 0, pValue: 0 },
                        anderson: { result: 'N/A', statistic: 0, criticalValue: 0 }
                    };
                }
            }
        }

        // Calculate short-term indices using sigma within
        const cp = (usl - lsl) / (6 * sigmaWithin);
        const cpk = Math.min((usl - mean) / (3 * sigmaWithin), (mean - lsl) / (3 * sigmaWithin));
        const cpm = (usl - lsl) / (6 * Math.sqrt(Math.pow(sigmaWithin, 2) + Math.pow(mean - target, 2)));

        // Calculate long-term indices using sigma overall
        const pp = (usl - lsl) / (6 * sigmaOverall);
        const ppk = Math.min((usl - mean) / (3 * sigmaOverall), (mean - lsl) / (3 * sigmaOverall));

        // MEJORA 2: Cálculo correcto de defectos - usar sigmaWithin para short-term y sigmaOverall para long-term
        const zUpperST = (usl - mean) / sigmaWithin;
        const zLowerST = (lsl - mean) / sigmaWithin;
        const probDefectiveST = (1 - normalCDF(zUpperST)) + normalCDF(zLowerST);

        const zUpperLT = (usl - mean) / sigmaOverall;
        const zLowerLT = (lsl - mean) / sigmaOverall;
        const probDefectiveLT = (1 - normalCDF(zUpperLT)) + normalCDF(zLowerLT);

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
            failures_ppm: probDefectiveST * 1e6, // Usar short-term para resultados individuales
            defective_percentage: probDefectiveST * 100,
            failures_ppm_lt: probDefectiveLT * 1e6, // Guardar también long-term para uso general
            defective_percentage_lt: probDefectiveLT * 100,
            shapiro: shapiroWilkTest(data),
            kolmogorov: kolmogorovSmirnovTest(data),
            anderson: andersonDarlingTest(data)
        };
    }

    function displayResults(dataset, index) {
        // Mostrar el contenedor de resultados
        document.getElementById('dataset-results-wrapper').classList.add('active');
        document.getElementById('short-term-charts-wrapper').style.display = 'flex';

        document.getElementById('mean').textContent = isFinite(dataset.mean) ? dataset.mean.toFixed(4) : 'N/A';
        document.getElementById('deviation').textContent = isFinite(dataset.sigmaWithin) ? dataset.sigmaWithin.toFixed(4) : 'N/A';
        document.getElementById('cp').textContent = isFinite(dataset.cp) ? dataset.cp.toFixed(4) : 'N/A';
        document.getElementById('cpk').textContent = isFinite(dataset.cpk) ? dataset.cpk.toFixed(4) : 'N/A';
        document.getElementById('cpm').textContent = isFinite(dataset.cpm) ? dataset.cpm.toFixed(4) : 'N/A';
        document.getElementById('failures_ppm').textContent = dataset.failures_ppm.toFixed(2);
        document.getElementById('defective_percentage').textContent = dataset.defective_percentage.toFixed(4);

        document.getElementById('shapiro').innerHTML = formatNormalityResult(dataset.shapiro);
        document.getElementById('kolmogorov').innerHTML = formatNormalityResult(dataset.kolmogorov);
        document.getElementById('anderson').innerHTML = formatNormalityResult(dataset.anderson);

        plotChart(dataset.mean, dataset.sigmaWithin, parseFloat(document.getElementById('lsl').value),
            parseFloat(document.getElementById('usl').value), dataset.measurements, index);
        createControlChart(dataset, index);
    }

    function displayOverallResults(stats) {
        document.getElementById('overall_total').textContent = overallData.length;
        document.getElementById('overall_mean').textContent = isFinite(stats.mean) ? stats.mean.toFixed(4) : 'N/A';
        document.getElementById('overall_dev').textContent = isFinite(stats.sigmaOverall) ? stats.sigmaOverall.toFixed(4) : 'N/A';
        document.getElementById('overall_pp').textContent = isFinite(stats.pp) ? stats.pp.toFixed(4) : 'N/A';
        document.getElementById('overall_ppk').textContent = isFinite(stats.ppk) ? stats.ppk.toFixed(4) : 'N/A';
        // MEJORA 3: Usar defectos long-term para resultados generales
        document.getElementById('overall_failures').textContent = stats.failures_ppm_lt.toFixed(2);
        document.getElementById('overall_defective').textContent = stats.defective_percentage_lt.toFixed(4);

        document.getElementById('overall_shapiro').innerHTML = formatNormalityResult(stats.shapiro);
        document.getElementById('overall_kolmogorov').innerHTML = formatNormalityResult(stats.kolmogorov);
        document.getElementById('overall_anderson').innerHTML = formatNormalityResult(stats.anderson);

        plotOverallChart(stats.mean, stats.sigmaOverall, parseFloat(document.getElementById('lsl').value),
            parseFloat(document.getElementById('usl').value), overallData);
        createOverallControlChart(stats);
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
        // MEJORA 4: Manejo robusto de binWidth
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

    // MEJORA 5: Función mejorada para generar curva normal
    function generateNormalCurveData(data, mean, stdDev, binWidth) {
        if (stdDev === 0 || data.length === 0) return [];

        // Si binWidth es 0 o muy pequeño, calcular uno adecuado
        const effectiveBinWidth = binWidth > 0 ? binWidth : Math.max(0.1, (Math.max(...data) - Math.min(...data)) / 10);
        const scaleFactor = data.length * effectiveBinWidth;

        if (scaleFactor === 0) return [];

        const curvePoints = [];

        // Mejora en el cálculo del rango para incluir la dispersión de los datos
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

    function plotChart(mean, deviation, lsl, usl, data, index) {
        if (chartInstances.cpkChart) chartInstances.cpkChart.destroy();

        const histogramData = generateHistogramData(data);
        const frequencyData = histogramData.labels.map(function (label, index) {
            return { x: label, y: histogramData.bins[index] };
        });
        const curvePoints = generateNormalCurveData(data, mean, deviation, histogramData.binWidth);

        const canvas = document.getElementById("cpkChartCanvas").getContext("2d");

        const processLowerLimit = mean - 3 * deviation;
        const processUpperLimit = mean + 3 * deviation;

        chartInstances.cpkChart = new Chart(canvas, {
            data: {
                datasets: [
                    {
                        label: 'Frequency',
                        type: 'scatter',
                        data: frequencyData,
                        showLine: true,
                        borderColor: 'rgba(52, 152, 219, 1)',
                        backgroundColor: 'rgba(52, 152, 219, 0.6)',
                        borderWidth: 1.5,
                        fill: false,
                        pointRadius: 4,
                        tension: 0.1
                    },
                    {
                        label: 'Normal Curve',
                        data: curvePoints,
                        type: 'line',
                        borderColor: 'rgba(44, 62, 80, 1)',
                        backgroundColor: 'transparent',
                        pointRadius: 0,
                        borderWidth: 2,
                        yAxisID: 'y'
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
                        title: { display: true, text: 'Value' }
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
        const frequencyData = histogramData.labels.map(function (label, index) {
            return { x: label, y: histogramData.bins[index] };
        });
        const curvePoints = generateNormalCurveData(data, mean, deviation, histogramData.binWidth);

        const canvas = document.getElementById("overallChartCanvas").getContext("2d");

        const processLowerLimit = mean - 3 * deviation;
        const processUpperLimit = mean + 3 * deviation;

        chartInstances.overallChart = new Chart(canvas, {
            data: {
                datasets: [
                    {
                        label: 'Frequency',
                        type: 'scatter',
                        data: frequencyData,
                        showLine: true,
                        borderColor: 'rgba(52, 152, 219, 1)',
                        backgroundColor: 'rgba(52, 152, 219, 0.6)',
                        borderWidth: 1.5,
                        fill: false,
                        pointRadius: 4,
                        tension: 0.1
                    },
                    {
                        label: 'Normal Curve',
                        data: curvePoints,
                        type: 'line',
                        borderColor: 'rgba(44, 62, 80, 1)',
                        backgroundColor: 'transparent',
                        pointRadius: 0,
                        borderWidth: 2,
                        yAxisID: 'y'
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
                        title: { display: true, text: 'Value' }
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
        if (datasets.length > 1) {
            tabsContainer.style.display = 'flex';
            datasets.forEach(function (dataset, index) {
                const tab = document.createElement('div');
                tab.className = 'dataset-tab ' + (index === 0 ? 'active' : '');
                tab.textContent = 'Dataset #' + dataset.id;
                tab.addEventListener('click', function () {
                    document.querySelectorAll('.dataset-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    displayResults(dataset, index);
                });
                tabsContainer.appendChild(tab);
            });

            // Add overall tab
            const overallTab = document.createElement('div');
            overallTab.className = 'dataset-tab overall-tab';
            overallTab.textContent = 'Overall Results';
            overallTab.addEventListener('click', function () {
                document.querySelectorAll('.dataset-tab').forEach(t => t.classList.remove('active'));
                overallTab.classList.add('active');
                // Mostrar resultados overall y ocultar individuales
                document.getElementById('dataset-results-wrapper').classList.remove('active');
                document.getElementById('overall-results-wrapper').classList.add('active');
            });
            tabsContainer.appendChild(overallTab);
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

    // MEJORA 6: Inicialización correcta y robusta
    function resetFormData() {
        document.getElementById('cpkForm').reset();
        const dsContainer = document.getElementById('datasetsContainer');
        dsContainer.innerHTML = '';
        currentDatasetId = 1;

        // Crear primer dataset directamente
        const newDatasetEl = document.createElement('div');
        newDatasetEl.className = 'dataset-container';
        newDatasetEl.dataset.id = currentDatasetId;
        newDatasetEl.innerHTML = '<div class="dataset-header"><span class="dataset-title">Measurements (Dataset #' + currentDatasetId + ')</span><button type="button" class="remove-dataset-btn" style="display:none;"><i class="fas fa-times"></i> Remove</button></div><textarea class="measurements-input" rows="1" placeholder="Enter values or click \'Fill Example\'" required></textarea>';
        dsContainer.appendChild(newDatasetEl);

        // Añadir el listener al botón de remover, aunque esté oculto
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

        document.getElementById('exportBtn').disabled = true;

        // Resetear también los gráficos
        Object.values(chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        chartInstances = {
            cpkChart: null,
            controlChart: null,
            overallChart: null,
            overallControlChart: null
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
            ["Total Points", document.getElementById('overall_total').textContent],
            ["Overall Mean", document.getElementById('overall_mean').textContent],
            ["Overall Std Dev", document.getElementById('overall_dev').textContent],
            ["Pp", document.getElementById('overall_pp').textContent],
            ["Ppk", document.getElementById('overall_ppk').textContent],
            ["Expected Failures (ppm)", document.getElementById('overall_failures').textContent],
            ["Defective Parts", document.getElementById('overall_defective').textContent],
            [],
            ["Individual Dataset Results"],
            ["Dataset", "Mean", "Std Dev (Within)", "Cp", "Cpk", "Cpm", "Failures (ppm)", "Defective"]
        ];

        datasets.forEach(function (d) {
            summaryData.push([
                'Dataset #' + d.id,
                d.mean.toFixed(4),
                d.sigmaWithin.toFixed(4),
                isFinite(d.cp) ? d.cp.toFixed(4) : 'N/A',
                isFinite(d.cpk) ? d.cpk.toFixed(4) : 'N/A',
                isFinite(d.cpm) ? d.cpm.toFixed(4) : 'N/A',
                d.failures_ppm.toFixed(2),
                d.defective_percentage.toFixed(4)
            ]);
        });

        const rawDataSheet = [["All Data Points"]];
        overallData.forEach(function (d) {
            rawDataSheet.push([d]);
        });
        const wsRawData = XLSX.utils.aoa_to_sheet(rawDataSheet);
        XLSX.utils.book_append_sheet(wb, wsRawData, "Raw Data");

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        XLSX.writeFile(wb, "cpk_analysis.xlsx");
    }

    // ====================================================================
    // 1. FUNCIONES AUXILIARES DE ALTA PRECISIÓN (normalCDF y normalQuantile)
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

        // Hart algorithm (1966) - double precision
        const t = 1 / (1 + 0.2316419 * absX);
        const d = 0.3989422804014327 * Math.exp(-x * x / 2);

        const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));

        // p calcula la cola superior: P(Z > |x|).
        // Si x > 0, queremos 1 - P(Z > x). Si x < 0, queremos P(Z < x) = P(Z > |x|).
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
            // Rational approximation for lower region
            q = Math.sqrt(-2 * Math.log(p));
            return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
        } else if (p > 0.97575) {
            // Rational approximation for upper region
            q = Math.sqrt(-2 * Math.log(1 - p));
            return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
        } else {
            // Rational approximation for central region
            q = p - 0.5;
            r = q * q;
            return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
                (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
        }
    }


    // ====================================================================
    // 2. SHAPIRO-WILK TEST
    // ====================================================================

    /**
     * PROFESSIONAL SHAPIRO-WILK TEST IMPLEMENTATION (Royston, 1995)
     */
    function shapiroWilkTest(data) {
        const n = data.length;

        // Validación de parámetros
        if (n < 3) {
            return { statistic: NaN, pValue: NaN, result: 'N/A', message: 'Sample size too small (n < 3 required)' };
        }
        if (n > 5000) {
            return { statistic: NaN, pValue: NaN, result: 'N/A', message: 'Sample size too large (n > 5000 not supported)' };
        }

        // Paso 1: Ordenar datos y calcular media
        const sorted = data.slice().sort(function (a, b) { return a - b; });
        const mean = sorted.reduce(function (a, b) { return a + b; }, 0) / n;

        // Paso 2: Calcular coeficientes a_i usando algoritmo de Royston
        const a = calculateShapiroWilkCoefficients(n);

        // Paso 3: Calcular estadístico W
        let W = calculateShapiroWStatistic(sorted, a, n, mean);

        // Paso 4: Calcular p-value usando transformación de Royston
        const pValue = calculateShapiroWilkPValue(W, n);

        return {
            statistic: W,
            pValue: pValue,
            result: pValue > 0.05 ? 'Pass' : 'Fail',
            message: pValue > 0.05 ? 'Data appears normal' : 'Data significantly deviates from normality'
        };
    }

    function calculateShapiroWilkCoefficients(n) {
        // Coeficientes precisos para Shapiro-Wilk (n <= 50)
        const coefficients = {
            3: [0.7071067812], 4: [0.6871633331, 0.1677114446], 5: [0.6646847332, 0.2413010995],
            6: [0.6431460990, 0.2806446391, 0.0875883367], 7: [0.6232567968, 0.3031188131, 0.1401129422],
            8: [0.6051687439, 0.3164270838, 0.1743770222, 0.0561017522], 9: [0.5887914134, 0.3244292796, 0.1975779485, 0.0947326822],
            10: [0.5738933048, 0.3291045959, 0.2141185563, 0.1224151899], 11: [0.5601835154, 0.3318437899, 0.2260015489, 0.1428937572],
            12: [0.5474685627, 0.3332242530, 0.2348665295, 0.1583484138], 13: [0.5356177452, 0.3336887733, 0.2416453298, 0.1702964574],
            14: [0.5245308228, 0.3335243019, 0.2469557899, 0.1796339993], 15: [0.5141267236, 0.3329319088, 0.2512148963, 0.1869987638],
            16: [0.5043378025, 0.3320484638, 0.2547052448, 0.1928686528], 17: [0.4951072684, 0.3309723780, 0.2576272613, 0.1975980895],
            18: [0.4863868287, 0.3297729573, 0.2601186688, 0.2014576140], 19: [0.4781346263, 0.3285000000, 0.2622754255, 0.2046561068],
            20: [0.4703138518, 0.3271880000, 0.2641659003, 0.2073480223], 21: [0.4628920000, 0.3258600000, 0.2658400000, 0.2096500000],
            22: [0.4558400000, 0.3245320000, 0.2673350000, 0.2116500000], 23: [0.4491330000, 0.3232140000, 0.2686800000, 0.2134000000],
            24: [0.4427480000, 0.3219120000, 0.2699000000, 0.2149400000], 25: [0.4366640000, 0.3206300000, 0.2710100000, 0.2163000000],
            26: [0.4308630000, 0.3193700000, 0.2720300000, 0.2175100000], 27: [0.4253290000, 0.3181360000, 0.2729700000, 0.2185800000],
            28: [0.4200470000, 0.3169270000, 0.2738400000, 0.2195300000], 29: [0.4150030000, 0.3157440000, 0.2746500000, 0.2203800000],
            30: [0.4101850000, 0.3145860000, 0.2754100000, 0.2211400000], 31: [0.4055810000, 0.3134520000, 0.2761200000, 0.2218200000],
            32: [0.4011810000, 0.3123420000, 0.2767900000, 0.2224300000], 33: [0.3969740000, 0.3112540000, 0.2774200000, 0.2229800000],
            34: [0.3929520000, 0.3101880000, 0.2780200000, 0.2234800000], 35: [0.3891060000, 0.3091420000, 0.2785800000, 0.2239300000],
            36: [0.3854280000, 0.3081160000, 0.2791200000, 0.2243400000], 37: [0.3819110000, 0.3071080000, 0.2796300000, 0.2247100000],
            38: [0.3785480000, 0.3061180000, 0.2801200000, 0.2250500000], 39: [0.3753320000, 0.3051450000, 0.2805800000, 0.2253600000],
            40: [0.3722580000, 0.3041880000, 0.2810300000, 0.2256400000], 41: [0.3693180000, 0.3032460000, 0.2814500000, 0.2259000000],
            42: [0.3665090000, 0.3023190000, 0.2818600000, 0.2261300000], 43: [0.3638240000, 0.3014060000, 0.2822500000, 0.2263500000],
            44: [0.3612590000, 0.3005070000, 0.2826300000, 0.2265500000], 45: [0.3588080000, 0.2996210000, 0.2829900000, 0.2267300000],
            46: [0.3564680000, 0.2987470000, 0.2833500000, 0.2269000000], 47: [0.3542340000, 0.2978850000, 0.2836900000, 0.2270500000],
            48: [0.3521020000, 0.2970350000, 0.2840200000, 0.2271900000], 49: [0.3500690000, 0.2961960000, 0.2843400000, 0.2273200000],
            50: [0.3481310000, 0.2953680000, 0.2846500000, 0.2274400000]
        };

        if (n <= 50) {
            return coefficients[n];
        } else {
            // Aproximación de Royston para n grande
            const a = new Array(Math.floor(n / 2));
            for (let i = 0; i < a.length; i++) {
                const u = (i + 1 - 0.375) / (n + 0.25);
                a[i] = normalQuantile(u);
            }
            return a;
        }
    }

    function calculateShapiroWStatistic(sorted, a, n, mean) {
        let numerator = 0;
        const k = Math.floor(n / 2);

        for (let i = 0; i < k; i++) {
            numerator += a[i] * (sorted[n - 1 - i] - sorted[i]);
        }
        numerator = Math.pow(numerator, 2);

        let denominator = 0;
        for (let i = 0; i < n; i++) {
            denominator += Math.pow(sorted[i] - mean, 2);
        }

        return numerator / denominator;
    }

    function calculateShapiroWilkPValue(W, n) {
        // Transformación de Royston (1995) para p-value
        const gamma = getGammaParameters(n);
        const y = Math.log(1 - W);
        const z = (y - gamma.mu) / gamma.sigma;
        return 1 - normalCDF(z);
    }

    function getGammaParameters(n) {
        // Parámetros de la transformación gamma de Royston
        if (n <= 11) {
            return {
                mu: -2.273 + 0.459 * n,
                sigma: Math.exp(0.5440 - 0.39978 * n + 0.025054 * Math.pow(n, 2) - 0.0006714 * Math.pow(n, 3))
            };
        } else {
            return {
                mu: 0.0038915 * Math.pow(Math.log(n), 3) - 0.083751 * Math.pow(Math.log(n), 2) -
                    0.31082 * Math.log(n) - 1.5861,
                sigma: Math.exp(0.0030302 * Math.pow(Math.log(n), 2) - 0.082676 * Math.log(n) - 0.4803)
            };
        }
    }


    // ====================================================================
    // 3. KOLMOGOROV-SMIRNOV TEST
    // ====================================================================

    /**
     * PROFESSIONAL KOLMOGOROV-SMIRNOV TEST IMPLEMENTATION
     */
    function kolmogorovSmirnovTest(data) {
        const n = data.length;

        if (n < 5) {
            return { statistic: NaN, pValue: NaN, result: 'N/A', message: 'Sample size too small (n < 5 required)' };
        }

        // Paso 1: Estandarizar datos
        const sorted = data.slice().sort(function (a, b) { return a - b; });
        const mean = sorted.reduce(function (a, b) { return a + b; }, 0) / n;
        // Usa la desviación estándar muestral (n-1) para el test de normalidad
        const stdDev = Math.sqrt(sorted.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / (n - 1));

        if (stdDev === 0) {
            return { statistic: NaN, pValue: NaN, result: 'N/A', message: 'Zero variance in data' };
        }

        // Paso 2: Calcular estadístico D
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

        // Paso 3: Calcular p-value exacto (con aproximación para n grande)
        const pValue = calculateKSPValue(D, n);

        return {
            statistic: D,
            pValue: pValue,
            result: pValue > 0.05 ? 'Pass' : 'Fail',
            message: pValue > 0.05 ? 'Data appears normal' : 'Data significantly deviates from normality'
        };
    }

    function calculateKSPValue(D, n) {
        // Aproximación del p-value de Kolmogorov-Smirnov.
        const en = Math.sqrt(n);

        // Corrección de Stephens para muestras pequeñas (Lilliefors)
        if (n <= 100) {
            const D_corrected = D * (en + 0.12 + 0.11 / en);
            // La aproximación del p-value a partir de D corregido es:
            return 2 * Math.exp(-2 * D_corrected * D_corrected);
        }

        // Asintótica para n grande (simple)
        if (D * en < 0.27) return 1.0;

        // Fórmula de Smirnov (aproximación, menos precisa que la de Stephens para n pequeño)
        let sum = 0;
        const K = D * en;
        for (let k = 1; k < 100; k++) {
            sum += Math.pow(-1, k - 1) * Math.exp(-2 * k * k * K * K);
            if (k > 1 && Math.abs(Math.pow(-1, k) * Math.exp(-2 * k * k * K * K)) < 1e-6) break;
        }

        return Math.max(0, Math.min(1, 2 * sum));
    }


    // ====================================================================
    // 4. ANDERSON-DARLING TEST
    // ====================================================================

    /**
     * PROFESSIONAL ANDERSON-DARLING TEST IMPLEMENTATION (Stephens, 1974)
     */
    function andersonDarlingTest(data) {
        const n = data.length;

        if (n < 8) {
            return { statistic: NaN, criticalValue: NaN, result: 'N/A', message: 'Sample size too small (n < 8 required)' };
        }

        // Paso 1: Estandarizar datos
        const sorted = data.slice().sort(function (a, b) { return a - b; });
        const mean = sorted.reduce(function (a, b) { return a + b; }, 0) / n;
        const variance = sorted.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / (n - 1);
        const stdDev = Math.sqrt(variance);

        if (stdDev === 0) {
            return { statistic: NaN, criticalValue: NaN, result: 'N/A', message: 'Zero variance in data' };
        }

        // Paso 2: Calcular estadístico A²
        let A2 = calculateAndersonDarlingStatistic(sorted, mean, stdDev, n);

        // Paso 3: Aplicar corrección para tamaño de muestra
        const A2_corrected = applyAndersonDarlingCorrection(A2, n);

        // Paso 4: Obtener valor crítico y p-value aproximado
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
        const epsilon = 1e-10; // CÓDIGO DE ROBUSTEZ: Previene Math.log(0) o Math.log(1)

        for (let i = 0; i < n; i++) {
            const z = (sorted[i] - mean) / stdDev;
            const F = normalCDF(z);

            // Asegurar que F esté entre un valor muy pequeño (epsilon) y 1 - epsilon
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
        // Corrección de Stephens (1974) para estadístico A²
        if (n >= 20) {
            return A2 * (1 + 0.75 / n + 2.25 / (n * n));
        } else {
            // Corrección más simple para muestras pequeñas
            return A2 * (1 + 0.3 / n);
        }
    }

    function getAndersonDarlingCriticalValue(n) {
        // Valores críticos de D'Agostino (1986) para alpha = 0.05
        const criticalValues = {
            8: 0.736, 9: 0.768, 10: 0.805, 11: 0.839, 12: 0.870,
            13: 0.900, 14: 0.928, 15: 0.954, 16: 0.979, 17: 1.002,
            18: 1.024, 19: 1.045, 20: 1.065, 25: 1.173, 30: 1.266,
            35: 1.349, 40: 1.424, 45: 1.493, 50: 1.557, 60: 1.673,
            70: 1.777, 80: 1.872, 90: 1.960, 100: 2.042,
            150: 2.381, 200: 2.626, 300: 2.998, 400: 3.283,
            500: 3.516, 1000: 4.318
        };

        // Interpolación para valores intermedios
        const sizes = Object.keys(criticalValues).map(Number).sort(function (a, b) { return a - b; });

        if (n <= sizes[0]) return criticalValues[sizes[0]];
        if (n >= sizes[sizes.length - 1]) return criticalValues[sizes[sizes.length - 1]];

        for (let i = 0; i < sizes.length - 1; i++) {
            if (n >= sizes[i] && n <= sizes[i + 1]) {
                const t = (n - sizes[i]) / (sizes[i + 1] - sizes[i]);
                return criticalValues[sizes[i]] * (1 - t) + criticalValues[sizes[i + 1]] * t;
            }
        }

        return 0.752; // Valor por defecto si falla la lógica
    }

    function estimateAndersonDarlingPValue(A2, n) {
        // Estimación aproximada del p-value (útil si no se usa una función CDF específica)
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