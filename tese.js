/*
 * DATA SOURCES FOR THE TRENDS OF ENGINEERING SYSTEMS EVOLUTION (TESE)
 * * The TESE framework (Trends of Engineering Systems Evolution) is based on the TRIZ 
 * (Theory of Inventive Problem Solving) methodology and its Laws of Technical Systems Evolution.
 * * * 1. Conceptual Basis (Laws of Technical Evolution):
 * - Altshuller, G. S. (1999). The innovation algorithm: TRIZ, systematic innovation and technical creativity. Technical Innovation Center.
 * * * 2. Structure of the 4-Stage Model (Infancy, Growth, Maturity, Decline) and Detailed Trends:
 * - Mann, D. (2007). Hands-on systematic innovation. CREAX Press. (Or later editions from the TRIZ School).
 * * * Note: Examples and icon mapping are illustrative and have been adapted for this code context.
 */

// tese.js - Trends of Engineering Systems Evolution Data and Functions

const teseData = {
    infancy: {
        stage: 'Infancy',
        trends: 'Increasing dynamism, coordination, and controllability',
        trendsArray: ['Increasing dynamism', 'Coordination', 'Controllability'],
        examples: `
            <div class="tese-example">
                <i class="fas fa-baby"></i>
                <strong>Examples:</strong> Early smartphones adding touchscreens and app ecosystems, 
                electric scooters with basic motor and battery systems, 
                initial versions of 3D printers with limited materials and resolution
            </div>
        `
    },
    growth: {
        stage: 'Growth',
        trends: 'Increasing ideality, completeness, and uneven development of parts',
        trendsArray: ['Increasing ideality', 'Completeness', 'Uneven development of parts'],
        examples: `
            <div class="tese-example">
                <i class="fas fa-seedling"></i>
                <strong>Examples:</strong> Electric vehicles improving battery technology and charging infrastructure, 
                smartphones adding multiple cameras and advanced features, 
                drones with improved stability and autonomous capabilities
            </div>
        `
    },
    maturity: {
        stage: 'Maturity',
        trends: 'Increasing complexity, trimming, and transition to supersystem',
        trendsArray: ['Increasing complexity', 'Trimming', 'Transition to supersystem'],
        examples: `
            <div class="tese-example">
                <i class="fas fa-tree"></i>
                <strong>Examples:</strong> Modern smartphones integrating multiple functions (camera, GPS, payment), 
                automobiles with advanced driver assistance systems, 
                smart home ecosystems with interconnected devices
            </div>
        `
    },
    decline: {
        stage: 'Decline',
        trends: 'Transition to new system (discontinuity)',
        trendsArray: ['Transition to new system (discontinuity)'],
        examples: `
            <div class="tese-example">
                <i class="fas fa-recycle"></i>
                <strong>Examples:</strong> Transition from film cameras to digital photography, 
                replacement of landline phones with mobile phones, 
                shift from physical media to streaming services
            </div>
        `
    }
};

// Mapeo de iconos para tendencias TESE
const teseTrendIconsDetailed = {
    "Increasing dynamism": "fa-sliders-h",
    "Coordination": "fa-sync-alt",
    "Controllability": "fa-gamepad",
    "Increasing ideality": "fa-rocket",
    "Completeness": "fa-check-circle",
    "Uneven development of parts": "fa-balance-scale-left",
    "Increasing complexity": "fa-sitemap",
    "Trimming": "fa-cut",
    "Transition to supersystem": "fa-expand-arrows-alt",
    "Transition to new system (discontinuity)": "fa-exchange-alt"
};

// Función para obtener datos TESE según la etapa
function getTeseData(stage) {
    return teseData[stage] || teseData.maturity;
}

// Función para generar iconos de tendencias TESE
function generateTeseTrendsIcons(trendsArray) {
    let iconsHTML = '<div class="tese-trends-icons">';

    trendsArray.forEach(trend => {
        const iconClass = teseTrendIconsDetailed[trend] || 'fa-chart-line';
        iconsHTML += `
            <div class="tese-trend-item">
                <div class="tese-trend-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="tese-trend-name">${trend}</div>
            </div>
        `;
    });

    iconsHTML += '</div>';
    return iconsHTML;
}