// physicalContradictionPrinciples.js
// Matriz de Principios Inventivos para Contradicciones Físicas basada en S. Litvin (1987)

const physicalContradictionPrinciples = {
    separate: {
        strategy: "Separating contradictory demands in space",
        description: "When operational zones/times do not intersect",
        principles: [
            {
                number: "1.1",
                name: "Division into parts",
                description: "Divide the system into many independent parts with opposite properties",
                example: "Safe fuel tank divided by partitions into isolated compartments"
            },
            {
                number: "1.2",
                name: "Taking out",
                description: "Separate from the system its part having one of the properties required",
                example: "Tape recording of frightened birds used to scare birds off aerodrome"
            },
            {
                number: "1.3",
                name: "Nested doll",
                description: "Place parts of the system with opposite properties one inside the other",
                example: "Device for applying fertilizer with metering screw made of two telescoping sections"
            },
            {
                number: "1.4",
                name: "Local quality",
                description: "Impart the required property to any part of the system",
                example: "Only a thin surface layer is carburized and hardened in vice jaws"
            },
            {
                number: "1.5",
                name: "Asymmetry / local form",
                description: "Switch from symmetrical to asymmetrical form for separation of contradictory requirements",
                example: "Shaped skid of Finnish sleigh - high in the footboard area and low in the rest"
            },
            {
                number: "1.6",
                name: "Transition to another dimension",
                description: "Resolve PhC associated with movement along line by transition to plane or volume",
                example: "Circular aerodrome with endless runways in concentric circles to reduce area"
            },
            {
                number: "1.7",
                name: "Copying",
                description: "Impart contradictory properties to a simplified copy or image of the system",
                example: "Measure photo of logs on platform instead of measuring actual logs"
            },
            {
                number: "1.8",
                name: "Intermediary",
                description: "Impart required property to an external element instead of the system",
                example: "Cans coated with special coating to increase strength without adding weight"
            },
            {
                number: "1.9",
                name: "Use of flexible shells and thin films",
                description: "Use very thin layer of substance to resolve PhC of presence/absence",
                example: "Beating meat in plastic bag to prevent splattering"
            },
            {
                number: "1.10",
                name: "Use of foam",
                description: "Use foamed substance (mostly air) to resolve PhC of presence/absence",
                example: "Slag foam on liquid slag surface to prevent solidification during transport"
            }
        ]
    },
    contiguous: {
        strategy: "Separating contradictory demands in time", 
        description: "When operational zones/times are contiguous",
        principles: [
            {
                number: "2.1",
                name: "Dynamization",
                description: "Impart conflicting properties to a system at different times by making it changeable",
                example: "MiG-21 aircraft with adjustable air inlet angle for different flight speeds"
            },
            {
                number: "2.2", 
                name: "Discarding and recovering",
                description: "Discard unnecessary parts and recover consumable parts during operation",
                example: "Plastic bottles that self-destruct under sunlight to avoid environmental pollution"
            },
            {
                number: "2.3",
                name: "Preliminary action", 
                description: "Give the system the required property in advance (completely or partially)",
                example: "Wood dyeing before the tree is cut down by introducing dye into the soil"
            },
            {
                number: "2.3.1",
                name: "In-advance cushioning",
                description: "Prepare emergency means beforehand to compensate low reliability",
                example: "Float attached to ship with soluble adhesive for detecting wreck locations"
            },
            {
                number: "2.4",
                name: "Periodic action", 
                description: "Alternate provision of two contradictory demands",
                example: "Pulse sprinkler supplying water as drops to prevent soil erosion"
            },
            {
                number: "2.4.1",
                name: "Mechanical vibration",
                description: "Vibration alternately carries out two states corresponding to different sides of PhC",
                example: "Vibro-conveyor using coordinated oscillations to move goods"
            },
            {
                number: "2.5",
                name: "Skipping",
                description: "Impart one conflicting requirement for a very short period of time", 
                example: "Unloading timber-carrying ship by sharp jerk to avoid overturning"
            },
            {
                number: "2.6",
                name: "Use of pauses, continuous useful action",
                description: "Carry out contradictory demand in pauses of the main action",
                example: "Heating thermocouple with current pulses and checking thermo-EMF in intervals"
            },
            {
                number: "2.7", 
                name: "Pneumatic and hydraulic structures",
                description: "Resolve size contradictions using air/water structures",
                example: "Using inflatable devices to lift damaged aircraft for easy transportation"
            },
            {
                number: "2.7.1",
                name: "Vacuuming",
                description: "Hold objects using atmospheric pressure without special devices",
                example: "Pressing cargo in ship hold using elastic gasket and air evacuation"
            },
            {
                number: "2.8",
                name: "Excessive action / after-action",
                description: "Introduce excess substance then remove unnecessary part",
                example: "Painting cylinders by dipping in paint then removing surplus by centrifugal force"
            }
        ]
    },
    intersect: {
        strategy: "Satisfying contradictory demands through system transition",
        description: "When operational zones/times intersect", 
        principles: [
            {
                number: "4.1",
                name: "Unification",
                description: "Every system in supersystem has certain property, entire supersystem has opposite",
                example: "Multiple aircraft join in air to form 'flying wing' with increased capacity"
            },
            {
                number: "4.2",
                name: "Blessing in disguise",
                description: "Harmful property in supersystem can play useful role or be compensated",
                example: "Waste car tires used for waste water treatment"
            },
            {
                number: "4.3",
                name: "Homogeneity",
                description: "PhC removed by coordination of components in super-system",
                example: "Ultrasonic rod made of same material as molten metal to avoid contamination"
            },
            {
                number: "4.4",
                name: "Equipotentiality",
                description: "Rebuild system to eliminate need to lift heavy system",
                example: "Transporting heavy pipes with pipe-track that lifts pipe slightly with jack"
            },
            {
                number: "5.1",
                name: "Segmentation",
                description: "System itself has some property, its subsystems have the opposite",
                example: "Traffic light with hinged pole elements for easy repair"
            },
            {
                number: "5.2",
                name: "Composite materials",
                description: "Each piece of material has its own property, but composite has different property",
                example: "Road pavement mixture of asphalt, crushed stone and rubber to reduce icing"
            },
            {
                number: "5.3",
                name: "Cheap short life instead of expensive durability",
                description: "Use multiple fragile, weak, short-lived objects instead of one durable",
                example: "Rotary internal combustion engine replaced after 500 hours of operation"
            },
            {
                number: "6.1",
                name: "Self-service",
                description: "System itself performs auxiliary functions without special maintenance systems",
                example: "Using oxide layer of metal to protect from corrosion"
            },
            {
                number: "6.2",
                name: "Universality",
                description: "System performs several different functions to avoid need for other systems",
                example: "Hollow frame used as fuel tank in motorcycle"
            },
            {
                number: "7.1",
                name: "System inversion",
                description: "Tool and product are interchanged",
                example: "Swimming pool with water flow where pool 'swims' along stationary swimmer"
            },
            {
                number: "7.2",
                name: "Anti-action",
                description: "Compensate harmful action with opposite action",
                example: "Ostankino TV tower reinforced with tensioning ropes compressing concrete"
            },
            {
                number: "7.2.1",
                name: "Anti-weight",
                description: "Compensate weight with lifting forces",
                example: "Balloons used to lay underwater cable in large ponds"
            }
        ]
    }
};

// Función auxiliar para obtener ejemplos de estrategias
function getPhysicalContradictionExample(relationship) {
    const examples = {
        separate: "During welding the steam pipe crack under pressure the patch is thrown off by a steam jet - it is suggested to replace the patch with a steam valve (during welding the valve is opened and then after welding closed/sealed). Welding and sealing are separated in time.",
        contiguous: "There is a conflict during optical glass grinding – polisher in polisher-glass contact area should be both hard for polishing and liquid for cooling. Conflict is resolved by making an ice polisher (abrasive grains is frozen into ice). During operation the polisher thaws and emits coolant (cold water).",
        intersect: "A conflict is highlighted in the problem of the vacuum cleaner noise – all the time during operation and in the whole tract the vortices must be small (to avoid noise) and large (to ensure the productivity). Conflict is resolved by a system transition - each vortex is small, and all together they constitute a big vortex (turbulent flow)."
    };
    return examples[relationship] || "No example available.";
}