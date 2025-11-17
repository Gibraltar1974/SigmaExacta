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