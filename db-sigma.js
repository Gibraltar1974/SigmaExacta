// 1. Inicializamos Dexie
const db = new Dexie("SigmaExactaDB");
db.version(1).stores({
    estado_paginas: 'ruta' // La 'primary key' será la URL de la página (ej: /cpk.html)
});

// 2. Función Universal de Guardado
async function guardarEstado() {
    const rutaActual = window.location.pathname;
    const datosFormulario = {};

    // Buscamos todos los inputs, selects y textareas
    const elementos = document.querySelectorAll('input, select, textarea');

    elementos.forEach(el => {
        // Solo guardamos si el elemento tiene ID (necesario para restaurarlo luego)
        if (el.id) {
            if (el.type === 'checkbox' || el.type === 'radio') {
                datosFormulario[el.id] = el.checked;
            } else {
                datosFormulario[el.id] = el.value;
            }
        }
    });

    try {
        await db.estado_paginas.put({
            ruta: rutaActual,
            datos: datosFormulario,
            timestamp: Date.now()
        });
        console.log('Autoguardado completado para:', rutaActual);
    } catch (e) {
        console.error('Error guardando:', e);
    }
}

// 3. Función Universal de Carga (Restaurar datos)
async function cargarEstado() {
    const rutaActual = window.location.pathname;

    try {
        const registro = await db.estado_paginas.get(rutaActual);

        if (registro && registro.datos) {
            Object.keys(registro.datos).forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.type === 'checkbox' || el.type === 'radio') {
                        el.checked = registro.datos[id];
                    } else {
                        el.value = registro.datos[id];
                    }
                    // Disparamos un evento 'change' para que tus cálculos se actualicen si tienen listeners
                    el.dispatchEvent(new Event('change'));
                    el.dispatchEvent(new Event('input'));
                }
            });
            console.log('Datos restaurados correctamente.');
        }
    } catch (e) {
        console.error('Error cargando:', e);
    }
}

// 4. Activadores automáticos
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos al abrir la página
    cargarEstado();

    // Guardar datos cada vez que el usuario cambie algo
    document.body.addEventListener('change', guardarEstado);
    document.body.addEventListener('input', debounce(guardarEstado, 1000)); // Espera 1 seg tras dejar de escribir
});

// Utilidad para no guardar en cada tecla pulsada, sino al terminar
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}