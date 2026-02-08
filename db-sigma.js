// Creamos la base de datos
const db = new Dexie("SigmaExactaDB");

// Definimos una tabla única llamada "herramientas"
// 'nombre' será el nombre de la página (ej: 'cpk', 'fmea')
// 'datos' guardará TODO el objeto o formulario que quieras
db.version(1).stores({
    herramientas: 'nombre' 
});

// Función genérica para guardar
async function guardarDatos(nombreHerramienta, objetoDatos) {
    try {
        await db.herramientas.put({
            nombre: nombreHerramienta,
            datos: objetoDatos,
            fecha: new Date().toISOString()
        });
        console.log(`Datos de ${nombreHerramienta} guardados.`);
    } catch (error) {
        console.error("Error al guardar:", error);
    }
}

// Función genérica para recuperar
async function cargarDatos(nombreHerramienta) {
    const resultado = await db.herramientas.get(nombreHerramienta);
    return resultado ? resultado.datos : null;
}