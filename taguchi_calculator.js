/**
 * taguchi_calculator.js
 * Lógica de cálculo matemático y estadístico para el Método Taguchi.
 */

const TaguchiCalculator = (function() {

    // --- DATOS ESTÁTICOS ---

    const orthogonalArrays = {
        'L4': { 'name': 'L4', 'description': '3 factors with 2 levels', 'factors': 3, 'levels': 2, 'runs': 4, 'array': [[1, 1, 1], [1, 2, 2], [2, 1, 2], [2, 2, 1]] },
        'L8': { 'name': 'L8', 'description': '7 factors with 2 levels', 'factors': 7, 'levels': 2, 'runs': 8, 'array': [[1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 2, 2, 2, 2], [1, 2, 2, 1, 1, 2, 2], [1, 2, 2, 2, 2, 1, 1], [2, 1, 2, 1, 2, 1, 2], [2, 1, 2, 2, 1, 2, 1], [2, 2, 1, 1, 2, 2, 1], [2, 2, 1, 2, 1, 1, 2]] },
        'L9': { 'name': 'L9', 'description': '4 factors with 3 levels', 'factors': 4, 'levels': 3, 'runs': 9, 'array': [[1, 1, 1, 1], [1, 2, 2, 2], [1, 3, 3, 3], [2, 1, 2, 3], [2, 2, 3, 1], [2, 3, 1, 2], [3, 1, 3, 2], [3, 2, 1, 3], [3, 3, 2, 1]] },
        'L16': { 'name': 'L16', 'description': '15 factors with 2 levels', 'factors': 15, 'levels': 2, 'runs': 16, 'array': [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2], [1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2], [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1], [1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 2], [1, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 1, 1], [1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1], [1, 2, 2, 2, 2, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2], [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2], [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1], [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 1], [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2], [2, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1], [2, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 1, 2], [2, 2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 1, 1, 2], [2, 2, 1, 2, 1, 1, 2, 2, 1, 1, 2, 1, 2, 2, 1]] }
    };

    const fCriticalValues = {
        1: { 1: 161.4, 2: 18.51, 3: 10.13, 4: 7.71, 5: 6.61, 6: 5.99, 7: 5.59, 8: 5.32, 9: 5.12, 10: 4.96, 11: 4.84, 12: 4.75, 13: 4.67, 14: 4.60, 15: 4.54, 16: 4.49, 20: 4.35, 30: 4.17 },
        2: { 1: 199.5, 2: 19.00, 3: 9.55, 4: 6.94, 5: 5.79, 6: 5.14, 7: 4.74, 8: 4.46, 9: 4.26, 10: 4.10, 11: 3.98, 12: 3.89, 13: 3.81, 14: 3.74, 15: 3.68, 16: 3.63, 20: 3.49, 30: 3.32 },
        3: { 1: 215.7, 2: 19.16, 3: 9.28, 4: 6.59, 5: 5.41, 6: 4.76, 7: 4.35, 8: 4.07, 9: 3.86, 10: 3.71, 11: 3.59, 12: 3.49, 13: 3.41, 14: 3.34, 15: 3.29, 16: 3.24, 20: 3.10, 30: 2.92 },
        4: { 1: 224.6, 2: 19.25, 3: 9.12, 4: 6.39, 5: 5.19, 6: 4.53, 7: 4.12, 8: 3.84, 9: 3.63, 10: 3.48, 11: 3.36, 12: 3.26, 13: 3.18, 14: 3.11, 15: 3.06, 16: 3.01, 20: 2.87, 30: 2.69 },
        5: { 1: 230.2, 2: 19.30, 3: 9.01, 4: 6.26, 5: 5.05, 6: 4.39, 7: 3.97, 8: 3.69, 9: 3.48, 10: 3.33, 11: 3.20, 12: 3.11, 13: 3.03, 14: 2.96, 15: 2.90, 16: 2.85, 20: 2.71, 30: 2.53 },
        6: { 1: 234.0, 2: 19.33, 3: 8.94, 4: 6.16, 5: 4.95, 6: 4.28, 7: 3.87, 8: 3.58, 9: 3.37, 10: 3.22, 11: 3.09, 12: 3.00, 13: 2.92, 14: 2.85, 15: 2.79, 16: 2.74, 20: 2.60, 30: 2.42 },
        7: { 1: 236.8, 2: 19.35, 3: 8.89, 4: 6.09, 5: 4.88, 6: 4.21, 7: 3.79, 8: 3.50, 9: 3.29, 10: 3.14, 11: 3.01, 12: 2.91, 13: 2.83, 14: 2.76, 15: 2.71, 16: 2.66, 20: 2.51, 30: 2.33 },
        8: { 1: 238.9, 2: 19.37, 3: 8.85, 4: 6.04, 5: 4.82, 6: 4.15, 7: 3.73, 8: 3.44, 9: 3.23, 10: 3.07, 11: 2.95, 12: 2.85, 13: 2.77, 14: 2.70, 15: 2.64, 16: 2.59, 20: 2.45, 30: 2.26 },
        10: { 1: 241.9, 2: 19.40, 3: 8.79, 4: 5.96, 5: 4.74, 6: 4.06, 7: 3.64, 8: 3.35, 9: 3.14, 10: 2.98, 11: 2.85, 12: 2.75, 13: 2.67, 14: 2.60, 15: 2.54, 16: 2.49, 20: 2.35, 30: 2.16 },
        15: { 1: 245.9, 2: 19.43, 3: 8.70, 4: 5.86, 5: 4.62, 6: 3.94, 7: 3.51, 8: 3.22, 9: 3.01, 10: 2.85, 11: 2.72, 12: 2.62, 13: 2.53, 14: 2.46, 15: 2.40, 16: 2.35, 20: 2.20, 30: 2.01 }
    };

    // --- FUNCIONES INTERNAS DE UTILIDAD ---

    function getFCritical(df1, df2) {
        if (df1 <= 0 || df2 <= 0) return Infinity;
        const availableDf1 = Object.keys(fCriticalValues).map(Number).sort((a, b) => a - b);
        const availableDf2Map = fCriticalValues[availableDf1[0]];
        const availableDf2 = Object.keys(availableDf2Map).map(Number).sort((a, b) => a - b);

        const conservativeDf1 = availableDf1.slice().reverse().find(k => k <= df1) || availableDf1[0];
        const conservativeDf2 = availableDf2.slice().reverse().find(k => k <= df2) || availableDf2[0];

        if (fCriticalValues[conservativeDf1] && fCriticalValues[conservativeDf1][conservativeDf2]) {
            return fCriticalValues[conservativeDf1][conservativeDf2];
        }
        return 4.0;
    }

    // --- FUNCIONES DE CÁLCULO ---

    function calculateSNR(experimentData, targetValue) {
        const perRunSNR = experimentData.results.map(y => {
            if (y === null || isNaN(y)) return 0;
            switch (experimentData.snrType) {
                case 'smaller':
                    return y === 0 ? -100 : -10 * Math.log10(y * y);
                case 'larger':
                    return y === 0 ? -100 : -10 * Math.log10(1 / (y * y));
                case 'nominal':
                    const deviation = y - targetValue;
                    return deviation === 0 ? 100 : -10 * Math.log10(deviation * deviation);
                default:
                    return 0;
            }
        });
        
        // Guardar resultado directamente en el objeto de datos
        experimentData.snrEffects = { perRun: perRunSNR };
    }

    function calculateFactorEffects(experimentData, useSnr = false) {
        const effects = {};
        const data = useSnr ? experimentData.snrEffects.perRun : experimentData.results;
        
        experimentData.factors.forEach((factor, factorIndex) => {
            effects[factor.name] = { levels: {}, range: 0 };
            factor.levels.forEach((level, levelIndex) => {
                let sum = 0, count = 0;
                experimentData.selectedArray.array.forEach((run, runIndex) => {
                    const runLevelIndex = Math.min(run[factorIndex] - 1, factor.levels.length - 1);
                    if (runLevelIndex === levelIndex) {
                        sum += data[runIndex];
                        count++;
                    }
                });
                effects[factor.name].levels[level] = count > 0 ? sum / count : 0;
            });
            const avgs = Object.values(effects[factor.name].levels);
            effects[factor.name].range = Math.max(...avgs) - Math.min(...avgs);
        });

        if (useSnr) {
            experimentData.snrEffects.byFactor = effects;
        } else {
            experimentData.factorEffects = effects;
        }
    }

    function determineOptimalLevels(experimentData) {
        experimentData.optimalSettings = {};
        
        // 1. Encontrar niveles óptimos basados en S/N (Maximizar S/N)
        Object.keys(experimentData.snrEffects.byFactor).forEach(factorName => {
            const factor = experimentData.snrEffects.byFactor[factorName];
            const levels = Object.entries(factor.levels);
            let optimalEntry = levels.reduce((max, curr) => curr[1] > max[1] ? curr : max);
            experimentData.optimalSettings[factorName] = { level: optimalEntry[0], snr_avg: optimalEntry[1] };
        });

        // 2. Asociar el valor de respuesta esperado a esos niveles
        Object.keys(experimentData.optimalSettings).forEach(factorName => {
            const optimalLevelName = experimentData.optimalSettings[factorName].level;
            experimentData.optimalSettings[factorName].response_avg = experimentData.factorEffects[factorName].levels[optimalLevelName];
        });
    }

    function calculatePredictedOutcome(experimentData) {
        const overallMean = experimentData.results.reduce((s, v) => s + v, 0) / experimentData.results.length;
        let predictedEffect = overallMean;

        Object.entries(experimentData.optimalSettings).forEach(([factorName, setting]) => {
            const factorEffect = setting.response_avg - overallMean;
            predictedEffect += factorEffect;
        });

        experimentData.predictedResult = predictedEffect;
    }

    function calculateANOVA(experimentData) {
        const results = experimentData.results;
        const n = results.length;
        if (n < 2) return;

        const overallMean = results.reduce((s, v) => s + v, 0) / n;
        const SSt = results.reduce((s, v) => s + (v - overallMean) ** 2, 0);

        let totalFactorSS = 0;
        let totalFactorDF = 0;
        experimentData.anova = {};

        experimentData.factors.forEach(factor => {
            let factorSS = 0;
            const runsPerLevel = n / factor.levels.length;
            Object.values(experimentData.factorEffects[factor.name].levels).forEach(levelMean => {
                factorSS += runsPerLevel * (levelMean - overallMean) ** 2;
            });
            const df = factor.levels.length - 1;
            totalFactorSS += factorSS;
            totalFactorDF += df;
            experimentData.anova[factor.name] = { ss: factorSS, df: df };
        });

        const errorDF = (n - 1) - totalFactorDF;
        const errorSS = Math.max(0, SSt - totalFactorSS);

        if (errorDF <= 0) {
            experimentData.anova.error = { ss: errorSS, df: 0, ms: 0 };
            experimentData.anova.total = { ss: SSt, df: n - 1 };
            Object.keys(experimentData.anova).filter(k => k !== 'error' && k !== 'total').forEach(k => {
                experimentData.anova[k].ms = experimentData.anova[k].df > 0 ? experimentData.anova[k].ss / experimentData.anova[k].df : 0;
                experimentData.anova[k].f = Infinity;
                experimentData.anova[k].isSignificant = 'N/A (Saturated)';
            });
            return;
        }

        const errorMS = errorSS / errorDF;

        Object.keys(experimentData.anova).filter(k => k !== 'error' && k !== 'total').forEach(factorName => {
            const anovaFactor = experimentData.anova[factorName];
            if (!anovaFactor.df) return;

            anovaFactor.ms = anovaFactor.ss / anovaFactor.df;
            anovaFactor.f = errorMS > 0 ? anovaFactor.ms / errorMS : Infinity;

            const fCritical = getFCritical(anovaFactor.df, errorDF);
            anovaFactor.isSignificant = anovaFactor.f > fCritical;
        });

        experimentData.anova.error = { ss: errorSS, df: errorDF, ms: errorMS };
        experimentData.anova.total = { ss: SSt, df: n - 1 };
    }

    // --- API PÚBLICA ---

    /**
     * Ejecuta el análisis completo mutando el objeto experimentData.
     * @param {Object} experimentData - Objeto con datos, factores y configuración.
     * @param {Number|null} nominalTarget - Valor objetivo si el tipo S/N es 'nominal'.
     */
    function runAnalysis(experimentData, nominalTarget) {
        if (experimentData.snrType === 'nominal') {
            experimentData.nominalTarget = nominalTarget;
        }

        calculateSNR(experimentData, nominalTarget);
        calculateFactorEffects(experimentData, false); // Efectos en Respuesta media
        calculateFactorEffects(experimentData, true);  // Efectos en S/N
        determineOptimalLevels(experimentData);
        calculatePredictedOutcome(experimentData);
        calculateANOVA(experimentData);
        
        return experimentData;
    }

    return {
        orthogonalArrays,
        runAnalysis
    };

})();