// TRIZ 76 Standard Solutions - Corrected Implementation
// Based on Ellen Domb, John Terninko, Joe Miller, Ellen MacGran classification
const trizStandardSolutions = {
    "Class 1: Improving system with no/little change": {
        description: "13 standard solutions for building or improving Su-Field systems with minimal changes",
        solutions: {
            "1.1.1": {
                title: "Complete an incomplete system",
                description: "If there is only S1, add S2 and field F to complete the system",
                principles: []
            },
            "1.1.2": {
                title: "Internal additive substance",
                description: "Introduce additive S3 inside S1 or between S1 and S2",
                principles: [35] // Change parameters
            },
            "1.1.3": {
                title: "External additive substance", 
                description: "Introduce external additive S3 to change S1 or S2",
                principles: [39] // Inert atmosphere
            },
            "1.1.4": {
                title: "Environment as additive",
                description: "Use environment resource as additive substance",
                principles: [35] // Change parameters
            },
            "1.1.5": {
                title: "Modify system environment",
                description: "Change the environment of the system",
                principles: [35, 39] // Change parameters, Inert atmosphere
            },
            "1.1.6": {
                title: "Control by surplus application/removal",
                description: "Apply surplus then remove excess for precise control",
                principles: [16] // Partial/excessive action
            },
            "1.1.7": {
                title: "Use intermediary object",
                description: "Use one object to make actions of another possible",
                principles: [24] // Intermediary
            },
            "1.1.8": {
                title: "Protect from strong fields / enhance weak fields",
                description: "Use S3 to protect areas from strong effects or enhance weak effects where needed",
                principles: [3, 11] // Local quality, Cushion in advance
            },
            "1.2.1": {
                title: "Introduce S3 to eliminate harmful effect",
                description: "Remove harmful effect by introducing S3 when useful/harmful effects coexist",
                principles: [22] // Blessing in disguise
            },
            "1.2.2": {
                title: "Modify S1/S2 to eliminate harmful effect",
                description: "Remove harmful effect by modifying elements or adding voids/air/bubbles",
                principles: [22] // Blessing in disguise
            },
            "1.2.3": {
                title: "Introduce S3 to absorb harmful field",
                description: "Introduce element S3 to absorb harmful effects caused by field",
                principles: [22] // Blessing in disguise
            },
            "1.2.4": {
                title: "Counteract harmful field with another field",
                description: "Use F2 to neutralize harmful F1 or gain additional useful effect",
                principles: [22] // Blessing in disguise
            },
            "1.2.5": {
                title: "Eliminate magnetic harmful effects",
                description: "Remove harmful magnetic effects by heating above Curie point or using opposite magnetic field",
                principles: [28, 36] // Replace mechanical system with fields, Phase transition
            }
        }
    },
    "Class 2: Improving system by changing system": {
        description: "23 standard solutions for evolving existing systems",
        solutions: {
            "2.1.1": {
                title: "Transition to complex Su-Field system",
                description: "Replace elementary system with more complex one",
                principles: [5] // Merging
            },
            "2.1.2": {
                title: "Develop Su-Field chain",
                description: "Develop chain of connected Su-Field systems", 
                principles: [5] // Merging
            },
            "2.1.3": {
                title: "Expand Su-Field system",
                description: "Expand system to include new elements",
                principles: [17] // Another dimension
            },
            "2.1.4": {
                title: "Simplify Su-Field system", 
                description: "Simplify by removing unnecessary elements",
                principles: [2, 5, 34] // Take out, Merging, Discard/recover
            },
            "2.1.5": {
                title: "Integrate similar systems",
                description: "Integrate multiple similar systems into unified structure",
                principles: [5] // Merging
            },
            "2.2.1": {
                title: "Replace with better controlled field",
                description: "Replace/supplement poorly controlled field with more easily controlled field",
                principles: [28] // Replace mechanical system with fields
            },
            "2.2.2": {
                title: "Divide into smaller units",
                description: "Use particles instead of whole object",
                principles: [1] // Segmentation  
            },
            "2.2.3": {
                title: "Use porous/capillary materials",
                description: "Use porous or capillary materials in system",
                principles: [31] // Porous materials
            },
            "2.2.4": {
                title: "Make system flexible",
                description: "Divide object into parts, make flexible by linking parts",
                principles: [1, 15] // Segmentation, Dynamism
            },
            "2.2.5": {
                title: "Replace with structured field",
                description: "Replace uncontrolled field with structured one",
                principles: [19] // Periodic action
            },
            "2.2.6": {
                title: "Change to non-uniform structure",
                description: "Change from uniform to structure specific to situation",
                principles: [3, 4, 30, 31] // Local quality, Asymmetry, Flexible shell, Porous materials
            },
            "2.3.1": {
                title: "Match natural frequencies", 
                description: "Match field frequencies with substance natural frequencies",
                principles: [18] // Mechanical vibration
            },
            "2.3.2": {
                title: "Coordinate system rhythms",
                description: "Coordinate rhythms of different system elements",
                principles: [19] // Periodic action
            },
            "2.3.3": {
                title: "Operation during downtime",
                description: "Do one operation during downtime of another",
                principles: [20] // Continuity of action
            },
            "2.4.1": {
                title: "Use ferromagnetic materials",
                description: "Use ferromagnetism and ferromagnetic materials",
                principles: [28] // Replace mechanical system with fields
            },
            "2.4.2": {
                title: "Ferromagnetic field application",
                description: "Apply ferromagnetic fields to system",
                principles: [28] // Replace mechanical system with fields  
            },
            "2.4.3": {
                title: "Use magnetic liquids",
                description: "Apply magnetic liquids in system",
                principles: [29] // Pneumatic/hydraulic
            },
            "2.4.4": {
                title: "Capillary structures with magnetism",
                description: "Use capillary/porous structures in magnetic materials",
                principles: [31] // Porous materials
            },
            "2.4.5": {
                title: "Temporary ferromagnetic additive",
                description: "Introduce ferromagnetic additive temporarily",
                principles: [24] // Intermediary
            },
            "2.4.6": {
                title: "Magnetic materials in environment",
                description: "Introduce magnetic materials in environment instead of object",
                principles: [13] // Other way around
            },
            "2.4.7": {
                title: "Magnetic transition effects",
                description: "Use physical effects of magnetic transitions", 
                principles: [36] // Use phase transition
            },
            "2.4.8": {
                title: "Dynamic magnetic fields",
                description: "Use dynamic magnetic fields",
                principles: [15, 23, 25] // Dynamism, Feedback, Self-service
            },
            "2.4.9": {
                title: "Magnetic particle structures",
                description: "Create structures using magnetic particles",
                principles: [24] // Intermediary
            }
        }
    },
    "Class 3: System transitions": {
        description: "6 standard solutions for system evolution",
        solutions: {
            "3.1.1": {
                title: "Transition to bisystem",
                description: "Transition from monosystem to bisystem",
                principles: [5] // Merging
            },
            "3.1.2": {
                title: "Transition to polysystem", 
                description: "Transition to multiple systems working together",
                principles: [5] // Merging
            },
            "3.1.3": {
                title: "System integration",
                description: "Integrate different systems into supersystem",
                principles: [5] // Merging
            },
            "3.1.4": {
                title: "Develop system links",
                description: "Develop stronger links between systems",
                principles: [5] // Merging
            },
            "3.1.5": {
                title: "Simplify bi-/poly-systems", 
                description: "Simplification of bi- and poly-systems",
                principles: [5] // Merging
            },
            "3.1.6": {
                title: "Evolution to higher control",
                description: "Transition system control to higher organizational level",
                principles: [12, 23] // Equipotentiality, Feedback
            }
        }
    },
    "Class 4: Detection and measurement": {
        description: "17 standard solutions for measurement and control",
        solutions: {
            "4.1.1": {
                title: "Control via phase transition/thermal expansion",
                description: "Control system via phase transition/thermal expansion instead of direct measurement",
                principles: [36, 37] // Phase transition, Thermal expansion
            },
            "4.1.2": {
                title: "Measure a copy",
                description: "Measure copy or model instead of actual object",
                principles: [24, 26] // Intermediary, Copying
            },
            "4.1.3": {
                title: "Use detection instead of measurement", 
                description: "Use detection methods instead of precise measurement",
                principles: [32] // Change color
            },
            "4.2.1": {
                title: "Create detectable field",
                description: "Create field that can be detected or measured",
                principles: [28] // Replace mechanical system with fields
            },
            "4.2.2": {
                title: "Ferromagnetic substance detection",
                description: "Introduce ferromagnetic substances to facilitate detection",
                principles: [28] // Replace mechanical system with fields
            },
            "4.2.3": {
                title: "Magnetic field detection",
                description: "Apply magnetic fields for detection",
                principles: [28] // Replace mechanical system with fields
            },
            "4.2.4": {
                title: "Resonant effects for detection",
                description: "Use resonant effects for improved detection",
                principles: [18] // Mechanical vibration
            },
            "4.2.5": {
                title: "Electromagnetic field detection",
                description: "Apply electromagnetic fields for detection",
                principles: [28] // Replace mechanical system with fields
            },
            "4.2.6": {
                title: "Physical effects for measurement",
                description: "Use physical effects for measurement",
                principles: [35] // Change parameters
            },
            "4.3.1": {
                title: "Measure via natural phenomena",
                description: "Measure system using natural phenomena and phase changes",
                principles: [32, 36] // Change color, Phase transition
            },
            "4.3.2": {
                title: "Resonant frequency measurement",
                description: "Measure changes via changes in resonant frequency",
                principles: [18] // Mechanical vibration
            },
            "4.3.3": {
                title: "Transition to detection system",
                description: "Transition from measuring to detecting system states",
                principles: [3, 32] // Local quality, Change color
            },
            "4.3.4": {
                title: "Develop measurement into detection",
                description: "Develop measurement system into detecting system",
                principles: [3, 23] // Local quality, Feedback
            },
            "4.3.5": {
                title: "Integrate measurement and action",
                description: "Combine measurement with action system",
                principles: [23] // Feedback
            },
            "4.3.6": {
                title: "Self-controlled measurement",
                description: "Implement self-controlled measurement changes",
                principles: [23, 25] // Feedback, Self-service
            },
            "4.3.7": {
                title: "Feedback in measurement",
                description: "Introduce feedback between measurement and action",
                principles: [23] // Feedback
            },
            "4.3.8": {
                title: "Enhanced detection methods",
                description: "Use advanced methods for improved detection and measurement",
                principles: [28, 32] // Replace mechanical system with fields, Change color
            }
        }
    },
    "Class 5: Strategies for simplification/improvement": {
        description: "17 standard solutions for system simplification",
        solutions: {
            "5.1.1.1": {
                title: "Add 'nothing' - foam, honeycomb, etc.",
                description: "Use voids, foam, honeycomb structures as additive",
                principles: [29, 40] // Pneumatic/hydraulic, Composite materials
            },
            "5.1.1.2": {
                title: "Use field instead of substance",
                description: "Apply field as substitute for physical substance",
                principles: [28] // Replace mechanical system with fields
            },
            "5.1.1.3": {
                title: "Use external field instead of internal",
                description: "Use external fields rather than internal substances",
                principles: [28] // Replace mechanical system with fields
            },
            "5.1.1.4": {
                title: "Use small amounts of active additives",
                description: "Apply small quantities of very active additives",
                principles: [38] // Strong oxidants
            },
            "5.1.1.5": {
                title: "Concentrate additive in one location", 
                description: "Localize additive concentration where needed",
                principles: [3] // Local quality
            },
            "5.1.1.6": {
                title: "Temporary additive introduction",
                description: "Introduce additive temporarily then remove",
                principles: [24] // Intermediary
            },
            "5.1.1.7": {
                title: "Apply additives to copy",
                description: "Apply additives to copy instead of original object",
                principles: [26] // Copying
            },
            "5.1.2": {
                title: "Use disposable field",
                description: "Introduce field that disappears after use",
                principles: [1] // Segmentation
            },
            "5.1.3": {
                title: "Additive disappears after use",
                description: "Use substances that vanish or transform after function",
                principles: [34] // Discard/recover
            },
            "5.1.4": {
                title: "Simulate with 'nothing'",
                description: "Use voids or environmental fields to simulate structures",
                principles: [16, 29] // Partial/excessive action, Pneumatic/hydraulic
            },
            "5.2.1": {
                title: "Use waste products as resources",
                description: "Utilize waste products and energy in system",
                principles: [25] // Self-service
            },
            "5.3.1": {
                title: "Phase change utilization",
                description: "Use phase transitions to change substance properties",
                principles: [35] // Change parameters
            },
            "5.3.2": {
                title: "Thermal expansion effects",
                description: "Utilize thermal expansion for system functions",
                principles: [37] // Use thermal expansion
            },
            "5.3.3": {
                title: "Use strong oxidants",
                description: "Apply strong oxidants to enhance reactions",
                principles: [38] // Strong oxidants
            },
            "5.3.4": {
                title: "Use inert environment",
                description: "Apply inert environment to prevent unwanted reactions", 
                principles: [39] // Inert atmosphere
            },
            "5.4.1": {
                title: "Self-controlled changes",
                description: "System serves itself without external help",
                principles: [23, 25] // Feedback, Self-service
            },
            "5.5.1": {
                title: "Use composite materials",
                description: "Apply composite materials with enhanced properties",
                principles: [40] // Composite materials
            }
        }
    }    
}; // 🔹 Cierre correcto del objeto trizStandardSolutions

// ==========================================================
// 🔧 Versión extendida: cubre los 6 tipos de problemas Su-Field
// ==========================================================

// Hacer el solutionMap disponible globalmente
const solutionMap = {
    insufficient: ["1.1.1", "1.1.2", "1.1.6", "2.2.1", "2.2.3"],
    excessive: ["1.1.4", "2.1.4", "2.3.1", "5.1.4"],
    harmful: ["1.1.3", "1.1.7", "1.2.1", "1.2.2", "1.2.3", "1.2.4", "1.2.5"],
    difficult: ["4.1.1", "4.1.2", "4.2.4", "4.3.1", "4.3.4", "4.3.6"],
    missing: ["1.1.1", "1.1.2", "1.1.3", "2.1.1", "2.2.1", "2.2.5"],
    inefficient: ["2.2.1", "2.3.1", "2.3.2", "5.4.1", "5.5.1"]
};

function getRecommendedStandardSolutions(problemType) {
    const recommendedIds = solutionMap[problemType] || [];
    const recommendedSolutions = [];

    for (const classKey in trizStandardSolutions) {
        const solutionClass = trizStandardSolutions[classKey];
        for (const solutionId in solutionClass.solutions) {
            if (recommendedIds.includes(solutionId)) {
                recommendedSolutions.push({
                    id: solutionId,
                    ...solutionClass.solutions[solutionId],
                    class: classKey
                });
            }
        }
    }

    return recommendedSolutions;
}

// ==========================================================
// 🔍 Función de verificación de integridad (mantener igual)
// ==========================================================
function verifySolutionCount() {
    let total = 0;
    const counts = {};

    for (const classKey in trizStandardSolutions) {
        const count = Object.keys(trizStandardSolutions[classKey].solutions).length;
        counts[classKey] = count;
        total += count;
    }

    console.log('Solution counts by class:', counts);
    console.log('Total solutions:', total);

    const expectedCounts = {
        "Class 1: Improving system with no/little change": 13,
        "Class 2: Improving system by changing system": 23,
        "Class 3: System transitions": 6,
        "Class 4: Detection and measurement": 17,
        "Class 5: Strategies for simplification/improvement": 17
    };

    let allMatch = true;
    for (const classKey in expectedCounts) {
        if (counts[classKey] !== expectedCounts[classKey]) {
            console.error(`MISMATCH in ${classKey}: Expected ${expectedCounts[classKey]}, got ${counts[classKey]}`);
            allMatch = false;
        }
    }

    if (allMatch && total === 76) {
        console.log('✅ SUCCESS: All class counts match the PDF exactly! Total: 76 solutions.');
    } else {
        console.error('❌ ERROR: Counts do not match the PDF specification.');
    }

    return {counts, total, allMatch};
}

// Verificación automática al cargar
verifySolutionCount();