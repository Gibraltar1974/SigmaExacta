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
            "2.1.6": {
                title: "Transition to microlevel Su-Field system",
                description: "Move from macro to microlevel interactions",
                principles: [1, 2, 4, 7, 30] // Segmentation, Taking out, Asymmetry, Nesting, Flexible shells
            },
            "2.1.7": {
                title: "Use microlevel resources/elements",
                description: "Utilize microlevel resources (e.g., small holes, thin films)",
                principles: [30, 31, 32] // Flexible shells, Porous materials, Change color
            },
            "2.2.1": {
                title: "Simplify field F",
                description: "Use simplified fields (e.g., gravity, centrifugal force)",
                principles: [12] // Equipotentiality
            },
            "2.2.2": {
                title: "Use multiple fields F1, F2",
                description: "Use two fields simultaneously to improve action",
                principles: [5] // Merging
            },
            "2.2.3": {
                title: "Use fields that can be manipulated easily",
                description: "Transition to fields that can be easily controlled (e.g., electric, magnetic)",
                principles: [28] // Replace mechanical system with fields
            },
            "2.3.1": {
                title: "Use intermediate element S3 to transfer action",
                description: "Transfer action between S1 and S2 using a non-standard intermediary S3",
                principles: [24] // Intermediary
            },
            "2.3.2": {
                title: "Transfer action to microlevel",
                description: "Transfer the necessary action to a microlevel structure",
                principles: [31] // Porous materials
            },
            "2.3.3": {
                title: "Transfer function to a different part of system",
                description: "Redistribute functions among components",
                principles: [3] // Local quality
            },
            "2.3.4": {
                title: "Introduce S3 to change properties of S1/S2",
                description: "Introduce S3 to temporarily or permanently change S1 or S2 properties",
                principles: [35] // Change parameters
            },
            "2.3.5": {
                title: "Use S3 to activate S1/S2",
                description: "Use S3 to activate or reactivate S1 or S2",
                principles: [35] // Change parameters
            },
            "2.4.1": {
                title: "Use magnetic system / ferromagnetic materials",
                description: "Convert a mechanical system into a magnetic one for control",
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
                title: "Transition to non-magnetic field",
                description: "Change from magnetic field to another field (e.g., electric)",
                principles: [28] // Replace mechanical system with fields
            },
            "2.4.8": {
                title: "Eliminate ferromagnetic component",
                description: "Remove the ferromagnetic component from the system",
                principles: [2] // Take out
            }
        }
    },
    "Class 3: System transitions": {
        description: "6 standard solutions for system transformation and stage changes",
        solutions: {
            "3.1.1": {
                title: "Transition to Field Control",
                description: "Change the system from simple mechanical to field-based control",
                principles: [28] // Replace mechanical system with fields
            },
            "3.1.2": {
                title: "Transition to Subsystem Control",
                description: "Introduce a controlling subsystem",
                principles: [35] // Change parameters
            },
            "3.1.3": {
                title: "Transition to Bi-Field System",
                description: "Use two independent fields that can be controlled separately",
                principles: [5] // Merging
            },
            "3.2.1": {
                title: "Use phase transitions",
                description: "Utilize changes in state (e.g., solid/liquid/gas) to perform an action",
                principles: [36] // Phase transition
            },
            "3.2.2": {
                title: "Use physical and chemical effects",
                description: "Employ physical or chemical phenomena to perform an action (e.g., adsorption)",
                principles: [35] // Change parameters
            },
            "3.2.3": {
                title: "Use high-speed processes",
                description: "Utilize phenomena that occur only at high speeds",
                principles: [21] // Skipping
            }
        }
    },
    "Class 4: Detection and measurement": {
        description: "17 standard solutions focused on measurement, detection, and failure analysis",
        solutions: {
            "4.1.1": {
                title: "Inversion for measurement",
                description: "Use reverse effect (e.g., measure by destroying the object)",
                principles: [13] // Other way around
            },
            "4.1.2": {
                title: "Change system state for measurement",
                description: "Temporarily change the state of the object for measurement (e.g., heat it)",
                principles: [35] // Change parameters
            },
            "4.1.3": {
                title: "Use different measurement scales",
                description: "Measure on different scales (micro/macro)",
                principles: [17] // Another dimension
            },
            "4.1.4": {
                title: "Measure an indirect property",
                description: "Measure related properties (e.g., temperature instead of pressure)",
                principles: [24] // Intermediary
            },
            "4.1.5": {
                title: "Use high-speed measurement",
                description: "Measure using short-duration events (e.g., pulses)",
                principles: [10, 21] // Prior action, Skipping
            },
            "4.1.6": {
                title: "Use environment for measurement",
                description: "Use the environment's response for indirect measurement",
                principles: [3] // Local quality
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
                title: "Chemical field detection",
                description: "Use chemical reactions or indicators for detection",
                principles: [35] // Change parameters
            },
            "4.3.1": {
                title: "Use temporary field for detection",
                description: "Apply a temporary field to make an object detectable",
                principles: [24] // Intermediary
            },
            "4.3.2": {
                title: "Use temporary chemical additive",
                description: "Introduce a temporary chemical substance for detection",
                principles: [24] // Intermediary
            },
            "4.4.1": {
                title: "Use system change for failure analysis",
                description: "Introduce a field to cause a failure for observation",
                principles: [25] // Copying
            },
            "4.4.2": {
                title: "Modify system for failure analysis",
                description: "Change parameters to simplify failure analysis",
                principles: [25] // Copying
            },
            "4.4.3": {
                title: "Modify system elements for failure analysis",
                description: "Change the elements of the system for better observation",
                principles: [25] // Copying
            }
        }
    },
    "Class 5: Strategies for simplification/improvement": {
        description: "17 standard solutions for radical elimination or simplification of systems",
        solutions: {
            "5.1.1.1": {
                title: "Use S1's own field",
                description: "Use S1's internal energy or field instead of an external field F",
                principles: [9, 29, 36] // Preliminary anti-action, Pneumatic/hydraulic, Phase transition
            },
            "5.1.1.2": {
                title: "Use environment's field",
                description: "Utilize the surrounding environment's field as F",
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
                title: "Temporary additive (Substance)",
                description: "Introduce S3 temporarily to achieve the effect, then remove it",
                principles: [24] // Intermediary
            },
            "5.1.1.7": {
                title: "Temporary additive (Field)",
                description: "Apply Field F temporarily to achieve the effect, then remove it",
                principles: [24] // Intermediary
            },
            "5.1.2.1": {
                title: "Use two fields and two substances",
                description: "Introduce a new system (S3 + F2) for a synergistic effect",
                principles: [5] // Merging
            },
            "5.1.2.2": {
                title: "Use Field F to replace S2",
                description: "Replace the substance S2 with an intense or modified field F",
                principles: [28] // Replace mechanical system with fields
            },
            "5.1.3.1": {
                title: "Simplify field F to S2's field",
                description: "Use the field generated by S2 itself as the operating field",
                principles: [28] // Replace mechanical system with fields
            },
            "5.1.3.2": {
                title: "Eliminate S1/S2 entirely",
                description: "Remove the object or tool, letting the other system component perform the action",
                principles: [2] // Taking out
            },
            "5.1.3.3": {
                title: "Eliminate Field F entirely",
                description: "Achieve the action through substance-substance interaction (S1-S2)",
                principles: [2] // Taking out
            },
            "5.1.4": {
                title: "Simplify field F by using environment",
                description: "Utilize environment resources to simplify the field F",
                principles: [28] // Replace mechanical system with fields
            },
            "5.2.1": {
                title: "Use system's internal energy for control",
                description: "Use internal resources (heat, waste, etc.) for control",
                principles: [29] // Pneumatic/hydraulic
            },
            "5.2.2": {
                title: "Use system's side effects for control",
                description: "Utilize unintended, secondary effects for control",
                principles: [22] // Blessing in disguise
            },
            "5.3.1": {
                title: "Simplify measurement by fusion",
                description: "Integrate the measurement element with the substance S1/S2",
                principles: [5] // Merging
            },
            "5.3.2": {
                title: "Simplify measurement by environment",
                description: "Use the environment as the measurement tool",
                principles: [3] // Local quality
            }
        }
    }
};

// ==========================================================
// 🗺️ Mapeo de soluciones a tipos de problemas Su-Field (TRIZ puro - Altshuller)
// ==========================================================
const solutionMap = {
    // Soluciones recomendadas para cada tipo de problema Su-Field (TRIZ ortodoxo)
    // Basado en Altshuller: "The Innovation Algorithm" y seguimientos por Savransky/Royzen/Terninko.
    insufficient: [
        // Clase 1.1 (Completar o mejorar interacción)
        "1.1.1", "1.1.2", "1.1.4", "1.1.5", "1.1.7", "1.1.8",
        // En caso mixto insufficient+harmful, Altshuller permite algunas 1.2
        "1.2.1", "1.2.2", "1.2.3", "1.2.4",
        // Clase 2 relevantes
        "2.1.1", "2.1.2", "2.1.3", "2.1.6", "2.1.7",
        "2.2.2", "2.2.3",
        "2.3.1", "2.3.2", "2.3.4", "2.3.5",
        "2.4.1", "2.4.2", "2.4.3", "2.4.4", "2.4.5", "2.4.6",
        // Clase 3 (cuando corresponde por cambio de estado/campo)
        "3.1.1", "3.1.2", "3.1.3", "3.2.1", "3.2.2", "3.2.3"
    ],

    harmful: [
        // Clase 1.2 principal para eliminar/neutralizar efectos dañinos
        "1.2.1", "1.2.2", "1.2.3", "1.2.4", "1.2.5",
        // Algunos 1.1 aplican en casos concretos
        "1.1.3", "1.1.7",
        // Clase 2 para modificar/eliminar estructuras problemáticas
        "2.1.4", "2.2.1", "2.3.3", "2.4.8",
        // Eliminaciones radicales (Clase 5)
        "5.1.3.2", "5.1.3.3"
    ],

    difficult: [
        // Toda la Clase 4 (detección/medición) es la ruta TRIZ para "difficult"
        "4.1.1", "4.1.2", "4.1.3", "4.1.4", "4.1.5", "4.1.6",
        "4.2.1", "4.2.2", "4.2.3", "4.2.4", "4.2.5", "4.2.6",
        "4.3.1", "4.3.2",
        "4.4.1", "4.4.2", "4.4.3",
        // Altshuller permite como soporte estas simplificaciones de medición
        "5.3.1", "5.3.2"
    ],

    missing: [
        // Añadir sustancia/campo: 1.1.x y luego Clase 2 que agrega recursos
        "1.1.1", "1.1.2", "1.1.4", "1.1.5", "1.1.7",
        "2.1.1", "2.1.2", "2.1.3", "2.1.5", "2.1.6", "2.1.7",
        "2.2.2",
        "2.3.1", "2.3.4", "2.3.5",
        "2.4.1", "2.4.2", "2.4.3", "2.4.4", "2.4.5", "2.4.6",
        "3.1.1", "3.1.2", "3.1.3", "3.2.1", "3.2.2", "3.2.3",
        // Casos en que se crea campo desde el entorno (Clase 5)
        "5.1.1.1", "5.1.1.2", "5.1.1.3"
    ],

    excessive: [
        // 1.2.x para eliminar/absorber exceso
        "1.2.1", "1.2.2", "1.2.3", "1.2.4", "1.2.5",
        // Clase 2 para eliminar componentes/campos
        "2.1.4", "2.2.1", "2.3.3", "2.4.8",
        // Eliminaciones radicales (Clase 5)
        "5.1.3.2", "5.1.3.3"
    ],

    inefficient: [
        // Mejoras y optimizaciones (Clase 1 → Clase 2 → Clase 5)
        "1.1.1", "1.1.2", "1.1.4", "1.1.5", "1.1.7",
        "2.1.1", "2.1.3", "2.1.7",
        "2.2.1",
        "2.3.2", "2.3.3",
        "3.2.3",
        "5.1.1.1", "5.1.1.2", "5.1.1.3",
        "5.1.2.2",
        "5.1.3.1", "5.1.3.2", "5.1.3.3",
        "5.1.4",
        "5.2.1", "5.2.2",
        "5.3.1", "5.3.2"
    ]
};

// ==========================================================
// 💡 Función para obtener soluciones recomendadas (Existente)
// ==========================================================
function getRecommendedStandardSolutions(problemType) {
    if (!solutionMap[problemType]) {
        return [];
    }

    const recommendedIds = solutionMap[problemType];
    const recommendedSolutions = [];

    // Recorrer las soluciones recomendadas por ID
    recommendedIds.forEach(id => {
        // Buscar la solución en trizStandardSolutions
        for (const classKey in trizStandardSolutions) {
            if (trizStandardSolutions[classKey].solutions[id]) {
                recommendedSolutions.push({
                    id: id,
                    title: trizStandardSolutions[classKey].solutions[id].title,
                    description: trizStandardSolutions[classKey].solutions[id].description,
                    class: classKey.split(':')[0]
                });
                return; // Una vez encontrada, pasar a la siguiente ID
            }
        }
    });

    return recommendedSolutions;
}

// ==========================================================
// 🌍 Hacer las variables accesibles globalmente (NUEVO)
// ==========================================================
window.solutionMap = solutionMap;
window.trizStandardSolutions = trizStandardSolutions;
window.getRecommendedStandardSolutions = getRecommendedStandardSolutions;

// ==========================================================
// 🔍 Función de verificación de integridad (Existente)
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

    return { counts, total, allMatch };
}

// Verificación automática al cargar
verifySolutionCount();
