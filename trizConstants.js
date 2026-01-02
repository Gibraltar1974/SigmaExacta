// Contiene todas las constantes estáticas de datos para la herramienta TRIZ (triz.html)
// IMPORTANTE: lifecycleRecommendations y lifecycleToLdstMapping ya están definidos en ldst.js

// Mapeo completo de todos los principios
const principles = {
    1: { name: "Segmentation", desc: "Divide an object into independent parts.", icon: "fa-puzzle-piece" },
    2: { name: "Taking out", desc: "Separate an interfering part or property from an object.", icon: "fa-external-link-alt" },
    3: { name: "Local quality", desc: "Change an object's structure from uniform to non-uniform.", icon: "fa-bullseye" },
    4: { name: "Asymmetry", desc: "Change the shape of an object from symmetrical to asymmetrical.", icon: "fa-not-equal" },
    5: { name: "Merging", desc: "Bring closer together (or merge) identical or similar objects.", icon: "fa-link" },
    6: { name: "Universality", desc: "Make a part or object perform multiple functions.", icon: "fa-toolbox" },
    7: { name: "Nested doll", desc: "Place one object inside another.", icon: "fa-layer-group" },
    8: { name: "Anti-weight", desc: "Compensate for weight by merging with objects that have lift.", icon: "fa-feather-alt" },
    9: { name: "Preliminary anti-action", desc: "Pre-load with counter-stresses to oppose known undesirable stresses later.", icon: "fa-shield-alt" },
    10: { name: "Preliminary action", desc: "Perform required changes to an object before it is needed.", icon: "fa-tasks" },
    11: { name: "Beforehand cushioning", desc: "Prepare emergency means beforehand.", icon: "fa-life-ring" },
    12: { name: "Equipotentiality", desc: "Limit position changes (e.g. in a gravity field).", icon: "fa-arrows-alt-v" },
    13: { name: "The other way round", desc: "Invert the action(s) used to solve the problem.", icon: "fa-retweet" },
    14: { name: "Spheroidality - Curvature", desc: "Use curvilinear parts, surfaces, or forms.", icon: "fa-circle-notch" },
    15: { name: "Dynamics", desc: "Allow characteristics to change to be optimal.", icon: "fa-sliders-h" },
    16: { name: "Partial or excessive actions", desc: "If 100% is hard, do slightly less or slightly more.", icon: "fa-adjust" },
    17: { name: "Another dimension", desc: "Move into a new dimension (e.g. 2D to 3D).", icon: "fa-cube" },
    18: { name: "Mechanical vibration", desc: "Cause an object to oscillate or vibrate.", icon: "fa-wave-square" },
    19: { name: "Periodic action", desc: "Instead of continuous action, use periodic or pulsating actions.", icon: "fa-history" },
    20: { name: "Continuity of useful action", desc: "Carry on work continuously.", icon: "fa-infinity" },
    21: { name: "Skipping", desc: "Conduct a process at high speed.", icon: "fa-shipping-fast" },
    22: { name: "Blessing in disguise", desc: "Use harmful factors to achieve a positive effect.", icon: "fa-recycle" },
    23: { name: "Feedback", desc: "Introduce feedback to improve a process.", icon: "fa-sync-alt" },
    24: { name: "Intermediary", desc: "Use an intermediary carrier article or process.", icon: "fa-hands-helping" },
    25: { name: "Self-service", desc: "Make an object serve itself.", icon: "fa-magic" },
    26: { name: "Copying", desc: "Use simpler and inexpensive copies.", icon: "fa-copy" },
    27: { name: "Cheap short-living objects", desc: "Replace an expensive object with multiple inexpensive ones.", icon: "fa-box" },
    28: { name: "Mechanics substitution", desc: "Replace mechanical means with sensory (optical, acoustic) means.", icon: "fa-magnet" },
    29: { name: "Pneumatics and hydraulics", desc: "Use gas and liquid parts instead of solid parts.", icon: "fa-water" },
    30: { name: "Flexible shells and thin films", desc: "Use flexible shells and thin films.", icon: "fa-film" },
    31: { name: "Porous materials", desc: "Make an object porous.", icon: "fa-braille" },
    32: { name: "Color changes", desc: "Change the color of an object or its environment.", icon: "fa-palette" },
    33: { name: "Homogeneity", desc: "Make objects interacting with a given object of the same material.", icon: "fa-equals" },
    34: { name: "Discarding and recovering", desc: "Make portions of an object that have fulfilled their functions go away.", icon: "fa-trash-restore" },
    35: { name: "Parameter changes", desc: "Change an object's physical state (e.g. gas, liquid, solid).", icon: "fa-thermometer-half" },
    36: { name: "Phase transitions", desc: "Use phenomena occurring during phase transitions.", icon: "fa-wind" },
    37: { name: "Thermal expansion", desc: "Use thermal expansion (or contraction) of materials.", icon: "fa-arrows-alt-h" },
    38: { name: "Strong oxidants", desc: "Replace ordinary air with enriched air or oxygen.", icon: "fa-fire" },
    39: { name: "Inert atmosphere", desc: "Replace a normal environment with an inert one.", icon: "fa-flask" },
    40: { name: "Composite materials", desc: "Change from uniform to composite materials.", icon: "fa-clone" },
    // Principios adicionales 2003
    41: { name: "Directional properties", desc: "Use anisotropic materials or structures.", icon: "fa-arrows-alt" },
    42: { name: "Homogeneity in materials", desc: "Make interacting elements from the same material.", icon: "fa-equals" },
    43: { name: "Inexpensive short-life", desc: "Replace expensive durable objects with cheap disposables.", icon: "fa-recycle" },
    44: { name: "Replacement of mechanical system", desc: "Replace mechanical systems with optical, thermal or acoustic systems.", icon: "fa-microchip" },
    45: { name: "Feedback introduction", desc: "Introduce feedback to improve system performance.", icon: "fa-sync-alt" },
    46: { name: "Counterweight application", desc: "Use counterweights to balance systems.", icon: "fa-balance-scale" },
    47: { name: "Preliminary saturation", desc: "Pre-saturate a system to prevent unwanted effects.", icon: "fa-fill-drip" },
    48: { name: "Mediator utilization", desc: "Use an intermediate object to transfer or transmit an action.", icon: "fa-hands-helping" }
};

// Mapeo de iconos específicos para principios de contradicciones físicas
const physicalPrincipleIcons = {
    1: "fa-cut", 2: "fa-external-link-alt", 3: "fa-map-marker-alt", 4: "fa-balance-scale-right",
    5: "fa-link", 6: "fa-toolbox", 7: "fa-box-open", 8: "fa-feather-alt", 9: "fa-shield-alt",
    10: "fa-forward", 11: "fa-umbrella", 12: "fa-balance-scale", 13: "fa-exchange-alt",
    14: "fa-circle", 15: "fa-expand-arrows-alt", 16: "fa-tachometer-alt", 17: "fa-cubes",
    18: "fa-wave-square", 19: "fa-redo-alt", 20: "fa-infinity", 21: "fa-running", 22: "fa-recycle",
    23: "fa-sync", 24: "fa-hands-helping", 25: "fa-robot", 26: "fa-clone", 27: "fa-boxes",
    28: "fa-microchip", 29: "fa-tint", 30: "fa-layer-group", 31: "fa-filter", 32: "fa-fill-drip",
    33: "fa-align-center", 34: "fa-trash-alt", 35: "fa-thermometer-half", 36: "fa-cloud",
    37: "fa-arrows-alt-h", 38: "fa-fire", 39: "fa-flask", 40: "fa-layer-group"
};

// Mapeo de iconos para soluciones estándar
const standardSolutionIcons = {
    "1.1.1": "fa-wrench", "1.1.2": "fa-plus-circle", "1.1.3": "fa-external-link-alt", "1.1.4": "fa-globe",
    "1.1.5": "fa-sync", "1.1.6": "fa-adjust", "1.1.7": "fa-hands-helping", "1.1.8": "fa-shield-alt",
    "1.2.1": "fa-ban", "1.2.2": "fa-eraser", "1.2.3": "fa-filter", "1.2.4": "fa-balance-scale",
    "1.2.5": "fa-magnet", "2.1.1": "fa-sitemap", "2.1.2": "fa-link", "2.1.3": "fa-expand-arrows-alt",
    "2.1.4": "fa-compress-arrows-alt", "2.1.5": "fa-object-group", "2.2.1": "fa-sliders-h",
    "2.2.2": "fa-puzzle-piece", "2.2.3": "fa-filter", "2.2.4": "fa-snowflake", "2.2.5": "fa-wave-square",
    "2.2.6": "fa-project-diagram", "2.3.1": "fa-wave-square", "2.3.2": "fa-redo-alt", "2.3.3": "fa-clock",
    "2.4.1": "fa-magnet", "2.4.2": "fa-bolt", "2.4.3": "fa-tint", "2.4.4": "fa-filter",
    "2.4.5": "fa-plus-circle", "2.4.6": "fa-globe", "2.4.7": "fa-cloud", "2.4.8": "fa-sliders-h",
    "2.4.9": "fa-puzzle-piece", "3.1.1": "fa-object-group", "3.1.2": "fa-sitemap", "3.1.3": "fa-link",
    "3.1.4": "fa-network-wired", "3.1.5": "fa-compress-arrows-alt", "3.1.6": "fa-arrow-up",
    "4.1.1": "fa-thermometer-half", "4.1.2": "fa-clone", "4.1.3": "fa-search", "4.2.1": "fa-bolt",
    "4.2.2": "fa-magnet", "4.2.3": "fa-magnet", "4.2.4": "fa-wave-square", "4.2.5": "fa-bolt",
    "4.2.6": "fa-ruler", "4.3.1": "fa-cloud", "4.3.2": "fa-wave-square", "4.3.3": "fa-search",
    "4.3.4": "fa-search-plus", "4.3.5": "fa-link", "4.3.6": "fa-robot", "4.3.7": "fa-sync",
    "4.3.8": "fa-search-plus", "5.1.1.1": "fa-th", "5.1.1.2": "fa-bolt", "5.1.1.3": "fa-external-link-alt",
    "5.1.1.4": "fa-vial", "5.1.1.5": "fa-map-marker-alt", "5.1.1.6": "fa-clock", "5.1.1.7": "fa-clone",
    "5.1.2": "fa-bolt", "5.1.3": "fa-trash-alt", "5.1.4": "fa-th", "5.2.1": "fa-recycle",
    "5.3.1": "fa-cloud", "5.3.2": "fa-arrows-alt-h", "5.3.3": "fa-fire", "5.3.4": "fa-flask",
    "5.4.1": "fa-robot", "5.5.1": "fa-layer-group"
};

// Mapeo de iconos para las clases de soluciones estándar
const classIcons = {
    "Class 1: Improving system with no/little change": "fa-tools",
    "Class 2: Improving system by changing system": "fa-arrow-up",
    "Class 3: System transitions": "fa-exchange-alt",
    "Class 4: Detection and measurement": "fa-ruler",
    "Class 5: Strategies for simplification/improvement": "fa-simplify"
};

// Mapeo de iconos para tipos de problemas Su-Field
const problemTypeIcons = {
    insufficient: "fa-arrow-down",
    harmful: "fa-skull",
    difficult: "fa-ruler-combined",
    missing: "fa-times",
    excessive: "fa-arrow-up",
    inefficient: "fa-hourglass-half",
    solution: "fa-check-circle"
};

// Mapeo de colores para cada tipo de problema
const problemTypeColors = {
    insufficient: "#3498db", harmful: "#e74c3c", difficult: "#f39c12",
    missing: "#95a5a6", excessive: "#9b59b6", inefficient: "#1abc9c", solution: "#00C853"
};

const sufieldSolutions = {
    insufficient: "<strong>Suggestion:</strong> The action is insufficient. Standard Solutions suggest introducing a new substance or field to enhance the action.",
    harmful: "<strong>Suggestion:</strong> The action is harmful. Standard Solutions suggest adding a neutralizing substance, modifying the 'Tool' or 'Object' to be immune.",
    difficult: "<strong>Suggestion:</strong> The interaction is hard to measure. Standard Solutions suggest using a copy of the system or a detectable additive.",
    missing: "<strong>Suggestion:</strong> The desired action is missing. Standard Solutions recommend introducing a new substance or field to create the action.",
    excessive: "<strong>Suggestion:</strong> The action is excessive. Standard Solutions suggest reducing the field, introducing a counter-field.",
    inefficient: "<strong>Suggestion:</strong> The action is inefficient. Standard Solutions suggest improving field efficiency, using resonance."
};

const standardSolutionClasses = {
    "Class 1: Improving system with no/little change": "This class focuses on building or improving Su-Field systems.",
    "Class 2: Improving system by changing system": "This class deals with evolving and developing existing Su-Field systems.",
    "Class 3: Transition to Supersystem and Microlevel": "This class involves transitions to higher-level systems and micro-level structures.",
    "Class 4: Measurement and Detection Standards": "This class provides solutions for measurement, detection and control problems.",
    "Class 5: Strategies for simplification and Improvement": "This class offers solutions for simplifying systems."
};

// NUEVA ESTRUCTURA DE EJEMPLOS - SOPORTANDO AMBAS CONTRADICCIONES
const examples = [
    {
        id: "ex1_pdf",
        title: "Bit Holder Evolution (LearningPosters PDF)",
        // STEP 1: Define Problem
        system: "Screwdriver Bit Holder (developed by Oliver Gerundt and Jochen Wessner 2019)",
        function: "To hold the bit firmly during operation",
        harm: "The hand has difficulty gripping the bit when changing it. Strong magnet holds well but makes extraction hard; weak magnet loses the bit.",

        // STEP 2: LDST
        lifecycleStage: "growth", // Transitioning to magnetic fields indicates growth/evolution

        // STEP 3: IFR (Page 7, Rule B)
        ifr: "The bit is magnetized and holds itself, eliminating the need for a separate holding mechanism.",

        // STEP 4: 9 Windows (Page 2 - Problem Oriented)
        nineWindows: {
            superPast: "Screw receives a coating",
            superPresent: "Screwdriver generates vibrations / Second hand catches bit",
            superFuture: "Helper picks up the bit and hands it over",
            systemPast: "Bit is coated so it slides out",
            systemPresent: "Bit holder with very strong magnet or locking mechanism",
            systemFuture: "Smart magnetic control / Adaptive system",
            subPast: "Bit holder generates additional holding force",
            subPresent: "Bit holder has a tight fit",
            subFuture: "Magnetic field properties / Self-holding material"
        },

        // STEP 5: Function Analysis (Page 5 & 6)
        functionAnalysis: {
            mainFunction: "Screw System drives Screw",
            targetComponent: "Screw",
            systemComponents: ["Pin", "Magnet", "Sleeve", "Bit"],
            supersystemComponents: ["Hand", "Relining", "Screw"],

            // INTERACTIONS MATRIX
            interactions: {
                // Relining con otros componentes
                "Relining-Pin": true,
                "Pin-Relining": true,

                // Pin con otros componentes
                "Pin-Magnet": true,
                "Magnet-Pin": true,
                "Pin-Sleeve": true,
                "Sleeve-Pin": true,

                // Sleeve con otros componentes
                "Sleeve-Magnet": true,
                "Magnet-Sleeve": true,
                "Sleeve-Bit": true,
                "Bit-Sleeve": true,

                // Magnet con otros componentes
                "Magnet-Bit": true,
                "Bit-Magnet": true,

                // Bit con otros componentes
                "Bit-Screw": true,
                "Screw-Bit": true,

                // Hand con otros componentes
                "Hand-Screw": true,
                "Screw-Hand": true
            },

            functions: [
                { carrier: "Relining", action: "holds", target: "Pin", category: "useful", performance: "normal" },
                { carrier: "Relining", action: "drives", target: "Pin", category: "useful", performance: "normal" },
                { carrier: "Pin", action: "limits", target: "Magnet", category: "useful", performance: "normal" },
                { carrier: "Pin", action: "holds", target: "Sleeve", category: "useful", performance: "normal" },
                { carrier: "Pin", action: "drives", target: "Sleeve", category: "useful", performance: "normal" },
                { carrier: "Magnet", action: "holds", target: "Bit", category: "useful", performance: "insufficient", comment: "Contradiction: Too strong for removal" },
                { carrier: "Sleeve", action: "holds", target: "Magnet", category: "useful", performance: "normal" },
                { carrier: "Sleeve", action: "guides", target: "Bit", category: "useful", performance: "normal" },
                { carrier: "Sleeve", action: "drives", target: "Bit", category: "useful", performance: "normal" },
                { carrier: "Bit", action: "drives", target: "Screw", category: "useful", performance: "normal" },
                { carrier: "Hand", action: "holds", target: "Screw", category: "useful", performance: "normal" }
            ]
        },

        // STEP 6: Technical Contradiction (Page 8)
        technicalContradiction: {
            active: true,
            matrixVersion: "classic",
            improvingFeature: 10, // 10: Strength (Fuerza)
            worseningFeature: 33, // 33: Ease of operation (Facilidad de operación)
            recommendedPrinciples: [
                { id: 1, name: "Segmentation", desc: "Divide an object into independent parts", example: "Divide sleeve into two parts" },
                { id: 28, name: "Mechanics substitution", desc: "Replace mechanical means with sensory means", example: "Use magnetic field instead of mechanical chuck" },
                { id: 3, name: "Local quality", desc: "Change an object's structure from uniform to non-uniform", example: "Locally change magnetic properties of sleeve to guide magnetic flux" },
                { id: 25, name: "Self-service", desc: "Make an object serve itself", example: "Bit magnetizes itself or screw is magnetized to hold onto bit" }
            ]
        },

        // STEP 7: Physical Contradiction (Page 8 - Alternative analysis)
        physicalContradiction: {
            active: true,
            conflictingParameter: "Magnetic holding force",
            ozDefinition: "spatial", // Different zones in the bit holder
            ozIntersection: "intersect", // Zones intersect in the same space
            separationMethod: "separationInSpace",
            recommendedStrategy: "Separation in space",
            recommendedPrinciples: [
                { id: 1, name: "Segmentation", desc: "Divide an object into independent parts", example: "Segment the magnetic field into zones" },
                { id: 3, name: "Local quality", desc: "Change an object's structure from uniform to non-uniform", example: "Create localized magnetic field variations" }
            ]
        },

        // STEP 8: Su-Field Analysis (Page 12)
        sufield: {
            systems: [
                {
                    object: "Bit",
                    tool: "Magnet",
                    field: "Magnetic",
                    type: "insufficient", // Contradiction: insufficient for removal when too strong
                    suggestion: "The magnetic field is either too strong (difficult to remove) or too weak (bit can be lost). Standard Solutions suggest adding a third substance (e.g., a tool to push out the bit) or using a controllable magnetic field (Standard 1.1.3 / 2.4.1)."
                }
            ]
        }
    },
    {
        id: "ex2_coffee",
        title: "Coffee Cup Thermal Management",
        // STEP 1: Define Problem
        system: "Coffee Cup",
        function: "To hold hot liquid",
        harm: "Burns the hand",

        // STEP 2: LDST
        lifecycleStage: "maturity",

        // STEP 3: IFR
        ifr: "The coffee cup itself holds hot liquid and protects the hand.",

        // STEP 4: 9 Windows
        nineWindows: {
            superPast: "Clay pottery, Ceramic workshops",
            superPresent: "Kitchen, Office, Coffee shop",
            superFuture: "Smart kitchens, Temperature-controlled environments",
            systemPast: "Simple ceramic cup",
            systemPresent: "Insulated travel mug",
            systemFuture: "Self-temperature-regulating cup",
            subPast: "Clay material, Glaze",
            subPresent: "Double wall, Vacuum insulation, Handle",
            subFuture: "Phase-change materials, Thermoelectric elements"
        },

        // STEP 5: Function Analysis
        functionAnalysis: {
            mainFunction: "Coffee System contains Liquid",
            targetComponent: "Liquid",
            systemComponents: ["Cup Wall", "Handle", "Lid"],
            supersystemComponents: ["Hand", "Air", "Table"],

            interactions: {
                "Cup Wall-Liquid": true,
                "Liquid-Cup Wall": true,
                "Cup Wall-Hand": true,
                "Hand-Cup Wall": true,
                "Handle-Hand": true,
                "Hand-Handle": true,
                "Lid-Liquid": true,
                "Liquid-Lid": true
            },

            functions: [
                { carrier: "Cup Wall", action: "contains", target: "Liquid", category: "useful", performance: "normal" },
                { carrier: "Cup Wall", action: "transfers", target: "Heat", category: "harmful", performance: "excessive", comment: "Too much heat transfer to hand" },
                { carrier: "Handle", action: "protects", target: "Hand", category: "useful", performance: "insufficient", comment: "Handle still gets hot" },
                { carrier: "Lid", action: "prevents", target: "Spilling", category: "useful", performance: "normal" }
            ]
        },

        // STEP 6: Technical Contradiction
        technicalContradiction: {
            active: true,
            matrixVersion: "classic",
            improvingFeature: 17, // 17: Temperature
            worseningFeature: 33, // 33: Ease of operation
            recommendedPrinciples: [
                { id: 3, name: "Local quality", desc: "Change an object's structure from uniform to non-uniform", example: "Insulate only the areas where hand touches" },
                { id: 40, name: "Composite materials", desc: "Change from uniform to composite materials", example: "Use layered materials with different thermal properties" }
            ]
        },

        // STEP 7: Physical Contradiction
        physicalContradiction: {
            active: true,
            conflictingParameter: "Temperature",
            ozDefinition: "spatial", // Different spatial zones
            ozIntersection: "intersect", // Hot liquid and hand contact zones intersect
            separationMethod: "separationInSpace",
            recommendedStrategy: "Separation in space",
            recommendedPrinciples: [
                { id: 3, name: "Local quality", desc: "Change an object's structure from uniform to non-uniform", example: "Hot interior, cool exterior" },
                { id: 4, name: "Asymmetry", desc: "Change the shape from symmetrical to asymmetrical", example: "Asymmetrical wall thickness" }
            ]
        },

        // STEP 8: Su-Field Analysis
        sufield: {
            systems: [
                {
                    object: "Hand",
                    tool: "Cup Wall",
                    field: "Thermal",
                    type: "harmful",
                    suggestion: "Thermal energy transfer from cup wall to hand is harmful. Standard Solutions suggest adding an insulating layer (S3) or changing the field type."
                }
            ]
        }
    },
    {
        id: "ex3_bicycle",
        title: "Bicycle Frame Strength vs Weight",
        // STEP 1: Define Problem
        system: "Bicycle Frame",
        function: "To support rider and components",
        harm: "Too heavy for optimal performance",

        // STEP 2: LDST
        lifecycleStage: "growth",

        // STEP 3: IFR
        ifr: "The bicycle frame supports all components with zero weight.",

        // STEP 4: 9 Windows
        nineWindows: {
            superPast: "Iron foundries, Blacksmith shops",
            superPresent: "Roads, Bike lanes, Repair shops",
            superFuture: "Smart roads, Automated transport systems",
            systemPast: "Solid iron frame",
            systemPresent: "Tubular steel/aluminum frame",
            systemFuture: "Carbon fiber monocoque",
            subPast: "Solid metal bars",
            subPresent: "Welded tubes, Joints",
            subFuture: "Composite fibers, Resin matrix"
        },

        // STEP 5: Function Analysis
        functionAnalysis: {
            mainFunction: "Bicycle System transports Rider",
            targetComponent: "Rider",
            systemComponents: ["Frame", "Wheels", "Handlebars", "Pedals"],
            supersystemComponents: ["Road", "Air", "Gravity"],

            interactions: {
                "Frame-Wheels": true,
                "Wheels-Frame": true,
                "Frame-Handlebars": true,
                "Handlebars-Frame": true,
                "Frame-Pedals": true,
                "Pedals-Frame": true,
                "Wheels-Road": true,
                "Road-Wheels": true
            },

            functions: [
                { carrier: "Frame", action: "supports", target: "Rider", category: "useful", performance: "normal" },
                { carrier: "Frame", action: "resists", target: "Forces", category: "useful", performance: "normal" },
                { carrier: "Frame", action: "adds", target: "Weight", category: "harmful", performance: "excessive", comment: "Too heavy for racing" },
                { carrier: "Wheels", action: "transmits", target: "Power", category: "useful", performance: "normal" }
            ]
        },

        // STEP 6: Technical Contradiction
        technicalContradiction: {
            active: true,
            matrixVersion: "classic",
            improvingFeature: 14, // 14: Strength
            worseningFeature: 1, // 1: Weight of moving object
            recommendedPrinciples: [
                { id: 40, name: "Composite materials", desc: "Change from uniform to composite materials", example: "Carbon fiber composites" },
                { id: 3, name: "Local quality", desc: "Change an object's structure from uniform to non-uniform", example: "Variable wall thickness in tubes" }
            ]
        },

        // STEP 7: Physical Contradiction
        physicalContradiction: {
            active: true,
            conflictingParameter: "Material density",
            ozDefinition: "spatial", // Different parts of frame
            ozIntersection: "no-intersect", // Strength needed in some areas, lightness in others
            separationMethod: "separationInSpace",
            recommendedStrategy: "Separation in space",
            recommendedPrinciples: [
                { id: 1, name: "Segmentation", desc: "Divide an object into independent parts", example: "Frame with different materials in different sections" },
                { id: 3, name: "Local quality", desc: "Change an object's structure from uniform to non-uniform", example: "Reinforced joints, lightweight tubes" }
            ]
        },

        // STEP 8: Su-Field Analysis
        sufield: {
            systems: [
                {
                    object: "Frame",
                    tool: "Material",
                    field: "Mechanical",
                    type: "inefficient",
                    suggestion: "Material adds excessive weight for required strength. Standard Solutions suggest using different materials (S2) or composite structures."
                }
            ]
        }
    }
];

// Exportar variables para uso global (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        principles,
        physicalPrincipleIcons,
        standardSolutionIcons,
        classIcons,
        problemTypeIcons,
        problemTypeColors,
        sufieldSolutions,
        standardSolutionClasses,
        examples
    };
}