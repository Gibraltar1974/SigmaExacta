// Contiene todas las constantes estáticas de datos para la herramienta TRIZ (triz.html)

// CORRECCIÓN: Mapeo completo de todos los principios (combinando ambos sets)
const principles = {
    1: {
        name: "Segmentation",
        desc: "Divide an object into independent parts.",
        icon: "fa-puzzle-piece",
        visual: "fa-object-group",
        example: "Divide a large system into smaller, manageable modules"
    },
    2: {
        name: "Taking out",
        desc: "Separate an interfering part or property from an object.",
        icon: "fa-external-link-alt",
        visual: "fa-external-link-alt",
        example: "Extract harmful component from a mixture"
    },
    3: {
        name: "Local quality",
        desc: "Change an object's structure from uniform to non-uniform.",
        icon: "fa-bullseye",
        visual: "fa-map-marker-alt",
        example: "Reinforce only the high-stress areas of a structure"
    },
    4: {
        name: "Asymmetry",
        desc: "Change the shape of an object from symmetrical to asymmetrical.",
        icon: "fa-not-equal",
        visual: "fa-balance-scale-right",
        example: "Use asymmetrical shapes for better ergonomics"
    },
    5: {
        name: "Merging",
        desc: "Bring closer together (or merge) identical or similar objects.",
        icon: "fa-link",
        visual: "fa-object-ungroup",
        example: "Combine multiple functions into one device"
    },
    6: {
        name: "Universality",
        desc: "Make a part or object perform multiple functions.",
        icon: "fa-toolbox",
        visual: "fa-tools",
        example: "A smartphone that also works as a camera, GPS, and payment device"
    },
    7: {
        name: "Nested doll",
        desc: "Place one object inside another.",
        icon: "fa-layer-group",
        visual: "fa-box-open",
        example: "Russian nesting dolls, telescopic poles"
    },
    8: {
        name: "Anti-weight",
        desc: "Compensate for weight by merging with objects that have lift.",
        icon: "fa-feather-alt",
        visual: "fa-weight-hanging",
        example: "Use helium balloons to lift heavy objects"
    },
    9: {
        name: "Preliminary anti-action",
        desc: "Pre-load with counter-stresses to oppose known undesirable stresses later.",
        icon: "fa-shield-alt",
        visual: "fa-grip-lines",
        example: "Pre-stressed concrete, vaccination"
    },
    10: {
        name: "Preliminary action",
        desc: "Perform required changes to an object before it is needed.",
        icon: "fa-tasks",
        visual: "fa-forward",
        example: "Pre-cut materials, pre-mixed solutions"
    },
    11: {
        name: "Beforehand cushioning",
        desc: "Prepare emergency means beforehand.",
        icon: "fa-life-ring",
        visual: "fa-umbrella",
        example: "Airbags in cars, safety nets"
    },
    12: {
        name: "Equipotentiality",
        desc: "Limit position changes (e.g. in a gravity field).",
        icon: "fa-arrows-alt-v",
        visual: "fa-balance-scale",
        example: "Elevators, hydraulic lifts"
    },
    13: {
        name: "The other way round",
        desc: "Invert the action(s) used to solve the problem.",
        icon: "fa-retweet",
        visual: "fa-exchange-alt",
        example: "Cool instead of heat, reverse process flow"
    },
    14: {
        name: "Spheroidality - Curvature",
        desc: "Use curvilinear parts, surfaces, or forms.",
        icon: "fa-circle-notch",
        visual: "fa-circle",
        example: "Spiral staircase, curved surfaces"
    },
    15: {
        name: "Dynamics",
        desc: "Allow characteristics to change to be optimal.",
        icon: "fa-sliders-h",
        visual: "fa-expand-arrows-alt",
        example: "Adjustable seats, variable-speed drives"
    },
    16: {
        name: "Partial or excessive actions",
        desc: "If 100% is hard, do slightly less or slightly more.",
        icon: "fa-adjust",
        visual: "fa-tachometer-alt",
        example: "Overspray then wipe, overfill then remove excess"
    },
    17: {
        name: "Another dimension",
        desc: "Move into a new dimension (e.g. 2D to 3D).",
        icon: "fa-cube",
        visual: "fa-cubes",
        example: "Spiral staircase instead of straight, 3D printing"
    },
    18: {
        name: "Mechanical vibration",
        desc: "Cause an object to oscillate or vibrate.",
        icon: "fa-wave-square",
        visual: "fa-wave-square",
        example: "Ultrasonic cleaning, vibration to prevent sticking"
    },
    19: {
        name: "Periodic action",
        desc: "Instead of continuous action, use periodic or pulsating actions.",
        icon: "fa-history",
        visual: "fa-redo-alt",
        example: "Pulsed laser, intermittent windshield wipers"
    },
    20: {
        name: "Continuity of useful action",
        desc: "Carry on work continuously.",
        icon: "fa-infinity",
        visual: "fa-infinity",
        example: "Assembly line, continuous processing"
    },
    21: {
        name: "Skipping",
        desc: "Conduct a process at high speed.",
        icon: "fa-shipping-fast",
        visual: "fa-running",
        example: "High-speed photography, rapid prototyping"
    },
    22: {
        name: "Blessing in disguise",
        desc: "Use harmful factors to achieve a positive effect.",
        icon: "fa-recycle",
        visual: "fa-recycle",
        example: "Use waste heat for power generation"
    },
    23: {
        name: "Feedback",
        desc: "Introduce feedback to improve a process.",
        icon: "fa-sync-alt",
        visual: "fa-sync",
        example: "Thermostats, automatic brightness adjustment"
    },
    24: {
        name: "Intermediary",
        desc: "Use an intermediary carrier article or process.",
        icon: "fa-hands-helping",
        visual: "fa-exchange-alt",
        example: "Catalyst in chemical reactions, adapter plugs"
    },
    25: {
        name: "Self-service",
        desc: "Make an object serve itself.",
        icon: "fa-magic",
        visual: "fa-robot",
        example: "Self-cleaning surfaces, self-sharpening blades"
    },
    26: {
        name: "Copying",
        desc: "Use simpler and inexpensive copies.",
        icon: "fa-copy",
        visual: "fa-clone",
        example: "Virtual prototypes, mockups for testing"
    },
    27: {
        name: "Cheap short-living objects",
        desc: "Replace an expensive object with multiple inexpensive ones.",
        icon: "fa-box",
        visual: "fa-boxes",
        example: "Disposable razors, single-use packaging"
    },
    28: {
        name: "Mechanics substitution",
        desc: "Replace mechanical means with sensory (optical, acoustic) means.",
        icon: "fa-magnet",
        visual: "fa-microchip",
        example: "Touch screens instead of buttons, optical sensors"
    },
    29: {
        name: "Pneumatics and hydraulics",
        desc: "Use gas and liquid parts instead of solid parts.",
        icon: "fa-water",
        visual: "fa-tint",
        example: "Hydraulic brakes, pneumatic tools"
    },
    30: {
        name: "Flexible shells and thin films",
        desc: "Use flexible shells and thin films.",
        icon: "fa-film",
        visual: "fa-layer-group",
        example: "Bubble wrap, flexible displays"
    },
    31: {
        name: "Porous materials",
        desc: "Make an object porous.",
        icon: "fa-braille",
        visual: "fa-filter",
        example: "Filters, sponges, breathable fabrics"
    },
    32: {
        name: "Color changes",
        desc: "Change the color of an object or its environment.",
        icon: "fa-palette",
        visual: "fa-fill-drip",
        example: "Thermochromic materials, warning colors"
    },
    33: {
        name: "Homogeneity",
        desc: "Make objects interacting with a given object of the same material.",
        icon: "fa-equals",
        visual: "fa-align-center",
        example: "Diamond cutting diamond, compatible materials"
    },
    34: {
        name: "Discarding and recovering",
        desc: "Make portions of an object that have fulfilled their functions go away.",
        icon: "fa-trash-restore",
        visual: "fa-trash-alt",
        example: "Biodegradable materials, rocket stage separation"
    },
    35: {
        name: "Parameter changes",
        desc: "Change an object's physical state (e.g. gas, liquid, solid).",
        icon: "fa-thermometer-half",
        visual: "fa-tint",
        example: "Freeze-drying, liquefied gases for storage"
    },
    36: {
        name: "Phase transitions",
        desc: "Use phenomena occurring during phase transitions.",
        icon: "fa-wind",
        visual: "fa-cloud",
        example: "Heat pipes, refrigeration cycles"
    },
    37: {
        name: "Thermal expansion",
        desc: "Use thermal expansion (or contraction) of materials.",
        icon: "fa-arrows-alt-h",
        visual: "fa-arrows-alt-h",
        example: "Thermostats, bimetallic strips"
    },
    38: {
        name: "Strong oxidants",
        desc: "Replace ordinary air with enriched air or oxygen.",
        icon: "fa-fire",
        visual: "fa-fire",
        example: "Oxygen-fuel welding, hyperbaric chambers"
    },
    39: {
        name: "Inert atmosphere",
        desc: "Replace a normal environment with an inert one.",
        icon: "fa-flask",
        visual: "fa-flask",
        example: "Argon welding, nitrogen packaging"
    },
    40: {
        name: "Composite materials",
        desc: "Change from uniform to composite materials.",
        icon: "fa-clone",
        visual: "fa-layer-group",
        example: "Carbon fiber composites, reinforced concrete"
    },
    // Principios adicionales para la matriz 2003
    41: {
        name: "Directional properties",
        desc: "Use anisotropic materials or structures.",
        icon: "fa-arrows-alt",
        visual: "fa-arrow-right",
        example: "Use materials that are stronger in one direction"
    },
    42: {
        name: "Homogeneity in materials",
        desc: "Make interacting elements from the same material.",
        icon: "fa-equals",
        visual: "fa-align-center",
        example: "Use same material for all parts to avoid corrosion"
    },
    43: {
        name: "Inexpensive short-life",
        desc: "Replace expensive durable objects with cheap disposables.",
        icon: "fa-recycle",
        visual: "fa-trash-alt",
        example: "Disposable medical equipment"
    },
    44: {
        name: "Replacement of mechanical system",
        desc: "Replace mechanical systems with optical, thermal or acoustic systems.",
        icon: "fa-microchip",
        visual: "fa-lightbulb",
        example: "Use laser instead of mechanical cutter"
    },
    45: {
        name: "Feedback introduction",
        desc: "Introduce feedback to improve system performance.",
        icon: "fa-sync-alt",
        visual: "fa-retweet",
        example: "Automatic brightness adjustment on displays"
    },
    46: {
        name: "Counterweight application",
        desc: "Use counterweights to balance systems.",
        icon: "fa-balance-scale",
        visual: "fa-weight-hanging",
        example: "Counterweights in elevators and cranes"
    },
    47: {
        name: "Preliminary saturation",
        desc: "Pre-saturate a system to prevent unwanted effects.",
        icon: "fa-fill-drip",
        visual: "fa-tint",
        example: "Pre-humidify air to prevent static electricity"
    },
    48: {
        name: "Mediator utilization",
        desc: "Use an intermediate object to transfer or transmit an action.",
        icon: "fa-hands-helping",
        visual: "fa-exchange-alt",
        example: "Use a catalyst in chemical reactions"
    }
};

// MODIFICACIÓN 3: Mapeo de iconos específicos para principios de contradicciones físicas
const physicalPrincipleIcons = {
    1: "fa-cut",           // Segmentation
    2: "fa-external-link-alt", // Extraction
    3: "fa-map-marker-alt", // Local Quality
    4: "fa-balance-scale-right", // Asymmetry
    5: "fa-link",          // Merging
    6: "fa-toolbox",       // Universality
    7: "fa-box-open",      // Nesting
    8: "fa-feather-alt",   // Anti-weight
    9: "fa-shield-alt",    // Preliminary anti-action
    10: "fa-forward",      // Prior action
    11: "fa-umbrella",     // Beforehand cushioning
    12: "fa-balance-scale", // Equipotentiality
    13: "fa-exchange-alt", // The other way round
    14: "fa-circle",       // Spheroidality
    15: "fa-expand-arrows-alt", // Dynamics
    16: "fa-tachometer-alt", // Partial or excessive actions
    17: "fa-cubes",        // Another dimension
    18: "fa-wave-square",  // Mechanical vibration
    19: "fa-redo-alt",     // Periodic action
    20: "fa-infinity",     // Continuity of useful action
    21: "fa-running",      // Skipping
    22: "fa-recycle",      // Blessing in disguise
    23: "fa-sync",         // Feedback
    24: "fa-hands-helping", // Intermediary
    25: "fa-robot",        // Self-service
    26: "fa-clone",        // Copying
    27: "fa-boxes",        // Cheap short-living objects
    28: "fa-microchip",    // Mechanics substitution
    29: "fa-tint",         // Pneumatics and hydraulics
    30: "fa-layer-group",  // Flexible shells and thin films
    31: "fa-filter",       // Porous materials
    32: "fa-fill-drip",    // Color changes
    33: "fa-align-center", // Homogeneity
    34: "fa-trash-alt",    // Discarding and recovering
    35: "fa-thermometer-half", // Parameter changes
    36: "fa-cloud",        // Phase transitions
    37: "fa-arrows-alt-h", // Thermal expansion
    38: "fa-fire",         // Strong oxidants
    39: "fa-flask",        // Inert atmosphere
    40: "fa-layer-group",  // Composite materials
    41: "fa-arrows-alt",   // Directional properties
    42: "fa-align-center", // Homogeneity in materials
    43: "fa-recycle",      // Inexpensive short-life
    44: "fa-microchip",    // Replacement of mechanical system
    45: "fa-sync-alt",     // Feedback introduction
    46: "fa-balance-scale", // Counterweight application
    47: "fa-fill-drip",    // Preliminary saturation
    48: "fa-hands-helping" // Mediator utilization
};

// MODIFICACIÓN 4: Mapeo de iconos específicos para soluciones estándar
const standardSolutionIcons = {
    "1.1.1": "fa-wrench",           // Complete an incomplete system
    "1.1.2": "fa-plus-circle",      // Internal additive substance
    "1.1.3": "fa-external-link-alt", // External additive substance
    "1.1.4": "fa-globe",            // Environment as additive
    "1.1.5": "fa-sync",             // Modify system environment
    "1.1.6": "fa-adjust",           // Control by surplus application/removal
    "1.1.7": "fa-hands-helping",    // Use intermediary object
    "1.1.8": "fa-shield-alt",       // Protect from strong fields / enhance weak fields
    "1.2.1": "fa-ban",              // Introduce S3 to eliminate harmful effect
    "1.2.2": "fa-eraser",           // Modify S1/S2 to eliminate harmful effect
    "1.2.3": "fa-filter",           // Introduce S3 to absorb harmful field
    "1.2.4": "fa-balance-scale",    // Counteract harmful field with another field
    "1.2.5": "fa-magnet",           // Eliminate magnetic harmful effects
    "2.1.1": "fa-sitemap",          // Transition to complex Su-Field system
    "2.1.2": "fa-link",             // Develop Su-Field chain
    "2.1.3": "fa-expand-arrows-alt", // Expand Su-Field system
    "2.1.4": "fa-compress-arrows-alt", // Simplify Su-Field system
    "2.1.5": "fa-object-group",     // Integrate similar systems
    "2.2.1": "fa-sliders-h",        // Replace with better controlled field
    "2.2.2": "fa-puzzle-piece",     // Divide into smaller units
    "2.2.3": "fa-filter",           // Use porous/capillary materials
    "2.2.4": "fa-snowflake",        // Make system flexible
    "2.2.5": "fa-wave-square",      // Replace with structured field
    "2.2.6": "fa-project-diagram",  // Change to non-uniform structure
    "2.3.1": "fa-wave-square",      // Match natural frequencies
    "2.3.2": "fa-redo-alt",         // Coordinate system rhythms
    "2.3.3": "fa-clock",            // Operation during downtime
    "2.4.1": "fa-magnet",           // Use ferromagnetic materials
    "2.4.2": "fa-bolt",             // Ferromagnetic field application
    "2.4.3": "fa-tint",             // Use magnetic liquids
    "2.4.4": "fa-filter",           // Capillary structures with magnetism
    "2.4.5": "fa-plus-circle",      // Temporary ferromagnetic additive
    "2.4.6": "fa-globe",            // Magnetic materials in environment
    "2.4.7": "fa-cloud",            // Magnetic transition effects
    "2.4.8": "fa-sliders-h",        // Dynamic magnetic fields
    "2.4.9": "fa-puzzle-piece",     // Magnetic particle structures
    "3.1.1": "fa-object-group",     // Transition to bisystem
    "3.1.2": "fa-sitemap",          // Transition to polysystem
    "3.1.3": "fa-link",             // System integration
    "3.1.4": "fa-network-wired",    // Develop system links
    "3.1.5": "fa-compress-arrows-alt", // Simplify bi-/poly-systems
    "3.1.6": "fa-arrow-up",         // Evolution to higher control
    "4.1.1": "fa-thermometer-half", // Control via phase transition/thermal expansion
    "4.1.2": "fa-clone",            // Measure a copy
    "4.1.3": "fa-search",           // Use detection instead of measurement
    "4.2.1": "fa-bolt",             // Create detectable field
    "4.2.2": "fa-magnet",           // Ferromagnetic substance detection
    "4.2.3": "fa-magnet",           // Magnetic field detection
    "4.2.4": "fa-wave-square",      // Resonant effects for detection
    "4.2.5": "fa-bolt",             // Electromagnetic field detection
    "4.2.6": "fa-ruler",            // Physical effects for measurement
    "4.3.1": "fa-cloud",            // Measure via natural phenomena
    "4.3.2": "fa-wave-square",      // Resonant frequency measurement
    "4.3.3": "fa-search",           // Transition to detection system
    "4.3.4": "fa-search-plus",      // Develop measurement into detection
    "4.3.5": "fa-link",             // Integrate measurement and action
    "4.3.6": "fa-robot",            // Self-controlled measurement
    "4.3.7": "fa-sync",             // Feedback in measurement
    "4.3.8": "fa-search-plus",      // Enhanced detection methods
    "5.1.1.1": "fa-th",             // Add 'nothing' - foam, honeycomb, etc.
    "5.1.1.2": "fa-bolt",           // Use field instead of substance
    "5.1.1.3": "fa-external-link-alt", // Use external field instead of internal
    "5.1.1.4": "fa-vial",           // Use small amounts of active additives
    "5.1.1.5": "fa-map-marker-alt", // Concentrate additive in one location
    "5.1.1.6": "fa-clock",          // Temporary additive introduction
    "5.1.1.7": "fa-clone",          // Apply additives to copy
    "5.1.2": "fa-bolt",             // Use disposable field
    "5.1.3": "fa-trash-alt",        // Additive disappears after use
    "5.1.4": "fa-th",               // Simulate with 'nothing'
    "5.2.1": "fa-recycle",          // Use waste products as resources
    "5.3.1": "fa-cloud",            // Phase change utilization
    "5.3.2": "fa-arrows-alt-h",     // Thermal expansion effects
    "5.3.3": "fa-fire",             // Use strong oxidants
    "5.3.4": "fa-flask",            // Use inert environment
    "5.4.1": "fa-robot",            // Self-controlled changes
    "5.5.1": "fa-layer-group"       // Composite materials
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
    insufficient: "fa-tachometer-alt",
    harmful: "fa-biohazard",
    difficult: "fa-search",
    missing: "fa-question-circle",
    excessive: "fa-bolt",
    inefficient: "fa-wrench"
};

// Mapeo de colores para cada tipo de problema
const problemTypeColors = {
    insufficient: "#3498db", // Azul
    harmful: "#e74c3c", // Rojo
    difficult: "#f39c12", // Naranja
    missing: "#9b59b6", // Púrpura
    excessive: "#e67e22", // Naranja oscuro
    inefficient: "#1abc9c" // Verde azulado
};

const sufieldSolutions = {
    insufficient: "<strong>Suggestion:</strong> The action is insufficient. Standard Solutions suggest introducing a new substance or field to enhance the action. Can you add a catalyst, a magnetic field, or modify the 'Tool' or 'Object' to be more receptive?",
    harmful: "<strong>Suggestion:</strong> The action is harmful. Standard Solutions suggest adding a neutralizing substance, modifying the 'Tool' or 'Object' to be immune, or introducing a counter-field to block the harm.",
    difficult: "<strong>Suggestion:</strong> The interaction is hard to measure. Standard Solutions suggest using a copy of the system, using a ferromagnetic additive that can be easily detected, or using a field that is easier to measure (e.g., optical instead of thermal).",
    missing: "<strong>Suggestion:</strong> The desired action is missing. Standard Solutions recommend introducing a new substance or field to create the action. This is the most open-ended case, requiring creative application of a new 'Tool' or 'Field'.",
    excessive: "<strong>Suggestion:</strong> The action is excessive. Standard Solutions suggest reducing the field, introducing a counter-field, or using a substance that can absorb or dissipate the excess.",
    inefficient: "<strong>Suggestion:</strong> The action is inefficient. Standard Solutions suggest improving field efficiency, using resonance, or changing the phase of the substance."
};

// Class descriptions for Standard Solutions
const standardSolutionClasses = {
    "Class 1: Improving system with no/little change": "This class focuses on building or improving Su-Field systems. Use these solutions when you need to introduce new elements to create or enhance a system.",
    "Class 2: Improving system by changing system": "This class deals with evolving and developing existing Su-Field systems. Use these when you need to make an existing system more complex, efficient, or coordinated.",
    "Class 3: Transition to Supersystem and Microlevel": "This class involves transitions to higher-level systems and micro-level structures. Use these when you need to think beyond the current system boundaries.",
    "Class 4: Measurement and Detection Standards": "This class provides solutions for measurement, detection and control problems. Use these when you need to improve how you measure or detect system states.",
    "Class 5: Strategies for simplification and Improvement": "This class offers solutions for simplifying systems and introducing effective changes. Use these when you need to make a system simpler, more efficient, or self-regulating."
};

// CORRECCIÓN: Ejemplos actualizados para usar combinaciones que existen en la matriz
// CORRECCIÓN: Ejemplos actualizados para usar LDST en lugar de TESE
const examples = [
    {
        system: "Bicycle Frame",
        function: "To support the rider",
        harm: "It is too heavy",
        ifr: "The frame supports the rider and is lightweight.",
        contradictionType: "technical",
        improvingFeature: 12,  // 13: Stability of the object (índice 12)
        worseningFeature: 0,   // 1: Weight of moving object (índice 0)
        sufield: { systems: [{ object: "Rider's weight", tool: "Frame tubes", field: "Mechanical", type: "insufficient" }] },
        ldstLaw: "law4", // Ley de Idealidad
        description: "Bicycle Frame - Law 4 example"
    },
    {
        system: "Sunglasses",
        function: "To block UV rays",
        harm: "They are too dark indoors",
        ifr: "The lenses block UV rays when needed and are clear when not.",
        contradictionType: "physical",
        conflictingParameter: "Lens Transparency",
        ozDefinition: "conditional",
        ozIntersection: "intersect",
        separationMethod: "separationInRelation",
        sufield: { systems: [{ object: "User's eyes", tool: "Dark lens", field: "Optical", type: "harmful" }] },
        ldstLaw: "law5", // Ley de Desarrollo Desigual
        description: "Sunglasses - Law 5 example"
    },
    {
        system: "Cooking Pot Handle",
        function: "To be held by the user",
        harm: "It gets too hot",
        ifr: "The handle can be held comfortably while the pot is hot.",
        contradictionType: "technical",
        improvingFeature: 31,  // 32: Ease of manufacture (índice 31)
        worseningFeature: 15,  // 16: Duration of action by a stationary object (índice 15)
        sufield: { systems: [{ object: "User's hand", tool: "Hot handle", field: "Thermal", type: "harmful" }] },
        ldstLaw: "law4", // Ley de Idealidad
        description: "Cooking Pot Handle - Law 4 example"
    },
    {
        system: "Packaging for electronics",
        function: "To protect the contents",
        harm: "It is difficult and frustrating to open",
        ifr: "The package protects the contents and opens easily.",
        contradictionType: "physical",
        conflictingParameter: "Strength/Toughness",
        ozDefinition: "temporal",
        ozIntersection: "no-intersect",
        separationMethod: "bypassContradictoryDemands",
        sufield: { systems: [{ object: "Electronic device", tool: "Packaging material", field: "Mechanical", type: "excessive" }] },
        ldstLaw: "law6", // Ley de Transición al Supersistema
        description: "Packaging for Electronics - Law 6 example"
    },
    {
        system: "Umbrella",
        function: "To shield from rain",
        harm: "It flips inside-out in strong wind",
        ifr: "The umbrella shields from rain and remains stable in wind.",
        contradictionType: "technical",
        improvingFeature: 3,   // 4: Length of stationary object (índice 3)
        worseningFeature: 10,  // 11: Stress or pressure (índice 10)
        sufield: { systems: [{ object: "User", tool: "Wind force", field: "Mechanical", type: "harmful" }] },
        ldstLaw: "law3", // Ley de Armonía
        description: "Umbrella - Law 3 example"
    },
    {
        system: "Car Engine",
        function: "To generate power",
        harm: "It produces a lot of waste heat",
        ifr: "The engine generates power without producing waste heat.",
        contradictionType: "technical",
        improvingFeature: 18,  // 19: Use of energy by moving object (índice 18)
        worseningFeature: 19,  // 20: Use of energy by stationary object (índice 19)
        sufield: {
            systems: [
                { object: "Piston", tool: "Fuel combustion", field: "Thermal", type: "harmful" },
                { object: "Coolant", tool: "Engine block", field: "Thermal", type: "inefficient" }
            ]
        },
        ldstLaw: "law7", // Ley de Transición Macro-Micro
        description: "Car Engine - Law 7 example"
    }
];