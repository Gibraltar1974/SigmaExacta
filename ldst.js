// ldst.js - LAWS OF TECHNICAL SYSTEMS DEVELOPMENT (LTSD) - CLASSICAL TRIZ
/*
 * LAWS OF TECHNICAL SYSTEMS DEVELOPMENT (LTSD) - CLASSICAL TRIZ
 * Based on the original work by Genrich Altshuller (1979-1985)
 * Public domain source: Altshuller, G. S. (1984). Creativity as an Exact Science
 */

const ldstLaws = {
    law1: {
        id: "law1",
        name: "Law of System Completeness",
        description: "A technical system must have all its essential parts and minimum necessary connections",
        principles: ["Completeness", "Energy conductivity", "Rhythm-frequency coordination"],
        examples: `
            <div class="tese-example">
                <i class="fas fa-cube"></i>
                <strong>Examples:</strong> Combustion engine (fuel, air, spark, cylinder), 
                writing system (pencil, paper, hand, brain), telephone (microphone, speaker, circuit)
            </div>
        `
    },
    law2: {
        id: "law2",
        name: "Law of Energy Conductivity",
        description: "Energy must flow without obstacles through all parts of the system",
        principles: ["Elimination of intermediaries", "Increased conductivity", "Energy transformation"],
        examples: `
            <div class="tese-example">
                <i class="fas fa-bolt"></i>
                <strong>Examples:</strong> Copper wires in electronics, gears in mechanics, 
                fiber optics in telecommunications, wireless transmission
            </div>
        `
    },
    law3: {
        id: "law3",
        name: "Law of Harmony",
        description: "System parts must be coordinated in rhythm, frequency and structure",
        principles: ["Synchronization", "Resonance", "Spatial-temporal coordination"],
        examples: `
            <div class="tese-example">
                <i class="fas fa-music"></i>
                <strong>Examples:</strong> Synchronized 4-stroke engine, multi-core processors, 
                coordinated transportation systems, musical orchestra
            </div>
        `
    },
    law4: {
        id: "law4",
        name: "Law of Ideality",
        description: "Systems evolve toward greater ideality (more functions, fewer resources)",
        principles: ["Elimination of parts", "Self-service", "Multiple functions"],
        examples: `
            <div class="tese-example">
                <i class="fas fa-rocket"></i>
                <strong>Examples:</strong> Smartphones (multiple devices in one), 
                electric vehicles (fewer moving parts), cloud software (no local installation)
            </div>
        `
    },
    law5: {
        id: "law5",
        name: "Law of Uneven Development",
        description: "System parts develop at different rates creating contradictions",
        principles: ["Identification of lagging subsystems", "Harmonization", "Leveling"],
        examples: `
            <div class="tese-example">
                <i class="fas fa-tachometer-alt"></i>
                <strong>Examples:</strong> Processors vs memory in computers, 
                batteries vs screens in mobile devices, engines vs brakes in automobiles
            </div>
        `
    },
    law6: {
        id: "law6",
        name: "Law of Transition to Supersystem",
        description: "Systems integrate into larger and more complex supersystems",
        principles: ["Integration", "Monopolization", "Expansion"],
        examples: `
            <div class="tese-example">
                <i class="fas fa-expand-arrows-alt"></i>
                <strong>Examples:</strong> Computer networks (Internet), 
                integrated transportation systems, mobile application ecosystems
            </div>
        `
    },
    law7: {
        id: "law7",
        name: "Law of Macro-Micro Transition",
        description: "Development moves toward microstructural levels and fields",
        principles: ["Fragmentation", "Use of fields", "Increased interactivity"],
        examples: `
            <div class="tese-example">
                <i class="fas fa-atom"></i>
                <strong>Examples:</strong> Transistors → integrated circuits → nanochips, 
                hand tools → machines → robots → nanobots
            </div>
        `
    },
    law8: {
        id: "law8",
        name: "Law of Increasing S-Field Complexity",
        description: "Systems evolve toward greater complexity of fields and substances",
        principles: ["Adding new fields", "Combining fields", "Transforming substances"],
        examples: `
            <div class="tese-example">
                <i class="fas fa-magnet"></i>
                <strong>Examples:</strong> Mechanical → electrical → electromagnetic → quantum, 
                simple tools → complex machines → intelligent systems
            </div>
        `
    }
};

// Icon mapping for LDST laws (unchanged as these are visual elements)
const ldstLawIcons = {
    "law1": "fa-cube",
    "law2": "fa-bolt",
    "law3": "fa-music",
    "law4": "fa-rocket",
    "law5": "fa-tachometer-alt",
    "law6": "fa-expand-arrows-alt",
    "law7": "fa-atom",
    "law8": "fa-magnet"
};

// Lifecycle stage to LDST laws mapping with correlation explanations
const lifecycleToLdstMapping = {
    "birth": ["law1", "law2"],
    "growth": ["law3", "law4"],
    "maturity": ["law5", "law6"],
    "decline": ["law7"],
    "transition": ["law8"]
};

// Lifecycle stage recommendations with correlation explanations
const lifecycleRecommendations = {
    "birth": "Focus on establishing complete system structure and energy flow",
    "growth": "Optimize coordination and move toward ideal system performance",
    "maturity": "Address subsystem imbalances and integrate into larger systems",
    "decline": "Transition to micro-levels and field-based solutions",
    "transition": "Increase field complexity for next-generation systems"
};

// Lifecycle to principles correlation matrix
const lifecyclePrinciplesCorrelation = {
    "birth": {
        "Completeness": "Establish all essential system components",
        "Energy conductivity": "Ensure energy flows through all system parts",
        "Rhythm-frequency coordination": "Set basic operational rhythms"
    },
    "growth": {
        "Synchronization": "Coordinate system components efficiently",
        "Resonance": "Leverage natural frequencies for performance",
        "Elimination of parts": "Remove unnecessary components",
        "Self-service": "Enable autonomous system functions"
    },
    "maturity": {
        "Identification of lagging subsystems": "Find and improve bottlenecks",
        "Harmonization": "Balance system performance",
        "Integration": "Connect with larger systems",
        "Monopolization": "Dominate specific functions"
    },
    "decline": {
        "Fragmentation": "Break into smaller, specialized components",
        "Use of fields": "Transition to field-based interactions",
        "Increased interactivity": "Enhance component communication"
    },
    "transition": {
        "Adding new fields": "Introduce advanced energy types",
        "Combining fields": "Create synergistic field interactions",
        "Transforming substances": "Change material compositions"
    }
};

// Function to get LDST data by law
function getLdstData(lawId) {
    return ldstLaws[lawId] || ldstLaws.law4; // Ideality law by default
}

// Function to generate LDST principles icons
function generateLdstPrinciplesIcons(principlesArray) {
    let iconsHTML = '<div class="tese-trends-icons">';

    principlesArray.forEach(principle => {
        iconsHTML += `
            <div class="tese-trend-item">
                <div class="tese-trend-icon">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <div class="tese-trend-name">${principle}</div>
            </div>
        `;
    });

    iconsHTML += '</div>';
    return iconsHTML;
}

// Function to generate lifecycle principles correlation table
function generateLifecyclePrinciplesTable() {
    let html = `
        <div class="content-block">
            <h4><i class="fas fa-table"></i> Lifecycle Stage - Principles Correlation Matrix</h4>
            <p style="margin-bottom: 1.5rem; font-style: italic; font-weight: bold;">
                This matrix shows how TRIZ principles correlate with different system lifecycle stages
            </p>
            <div style="overflow-x: auto;">
                <table class="trends-table">
                    <thead>
                        <tr>
                            <th>Lifecycle Stage</th>
                            <th>Recommended Principles</th>
                            <th>Application Focus</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    for (const [stage, principles] of Object.entries(lifecyclePrinciplesCorrelation)) {
        const stageName = getLifecycleStageName(stage);
        const principlesList = Object.keys(principles).join(', ');
        const applicationFocus = Object.values(principles)[0]; // First principle's application focus

        html += `
            <tr>
                <td><strong>${stageName}</strong></td>
                <td>${principlesList}</td>
                <td>${applicationFocus}</td>
            </tr>
        `;
    }

    html += `
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                <h5><i class="fas fa-info-circle"></i> How to Use This Matrix</h5>
                <ul>
                    <li><strong>Birth Stage:</strong> Focus on establishing fundamental system structure and energy pathways</li>
                    <li><strong>Growth Stage:</strong> Optimize coordination and eliminate inefficiencies</li>
                    <li><strong>Maturity Stage:</strong> Address performance bottlenecks and integration opportunities</li>
                    <li><strong>Decline Stage:</strong> Transition to more advanced technological paradigms</li>
                    <li><strong>Transition Stage:</strong> Prepare for next-generation system architecture</li>
                </ul>
            </div>
        </div>
    `;

    return html;
}

// Helper function to get lifecycle stage display name
function getLifecycleStageName(stageKey) {
    const stageNames = {
        "birth": "Birth (Introduction Phase)",
        "growth": "Growth Phase",
        "maturity": "Maturity Phase",
        "decline": "Decline Phase",
        "transition": "Transition to New System"
    };
    return stageNames[stageKey] || stageKey;
}

// Function to get principles for specific lifecycle stage
function getPrinciplesForLifecycleStage(stage) {
    return lifecyclePrinciplesCorrelation[stage] || {};
}

// Function to generate detailed lifecycle principles explanation
function generateLifecyclePrinciplesExplanation(stage) {
    const principles = getPrinciplesForLifecycleStage(stage);
    const stageName = getLifecycleStageName(stage);

    let html = `
        <div class="content-block">
            <h4><i class="fas fa-lifecycle"></i> ${stageName} - Principles Application Guide</h4>
            <p><strong>Focus Area:</strong> ${lifecycleRecommendations[stage]}</p>
    `;

    for (const [principle, application] of Object.entries(principles)) {
        html += `
            <div style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                <h5><i class="fas fa-lightbulb"></i> ${principle}</h5>
                <p><strong>Application:</strong> ${application}</p>
            </div>
        `;
    }

    html += `</div>`;
    return html;
}