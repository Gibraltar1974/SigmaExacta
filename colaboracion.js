let docEditor;
let currentFileId = null;

async function hacerCheckout() {
    if (!window.cycleData || Object.keys(window.cycleData).length === 0) {
        alert("Primero debes generar el informe PDCA.");
        return;
    }

    // Pedir al usuario un nombre para el archivo Excel
    let nombreArchivo = prompt("Introduce un nombre para el archivo Excel (sin extensión):", "Informe_PDCA");
    if (!nombreArchivo) {
        // Si cancela o deja vacío, usamos un nombre por defecto con timestamp
        nombreArchivo = `PDCA_Report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    } else {
        // Limpiar caracteres no válidos para nombre de archivo
        nombreArchivo = nombreArchivo.replace(/[\\/:*?"<>|]/g, '_');
    }

    document.getElementById('btnCheckout').style.display = 'none';
    document.getElementById('btnCheckin').style.display = 'inline-block';

    const contenedor = document.getElementById('contenedorOnlyOffice');
    contenedor.style.display = 'block';
    contenedor.innerHTML = '<p style="text-align:center; padding-top:200px;">Creando archivo en la nube...</p>';

    try {
        const respuesta = await fetch('/.netlify/functions/crearExcelEnDocSpace', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                datosInforme: window.cycleData,
                nombreArchivo: nombreArchivo
            })
        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || 'Error al crear el archivo');
        }

        const { fileId } = await respuesta.json();
        currentFileId = fileId;

        const config = {
            id: fileId,
            frameId: "contenedorOnlyOffice",
            width: "100%",
            height: "500px"
        };

        docEditor = DocSpace.SDK.initEditor(config);

    } catch (error) {
        alert('No se pudo crear el archivo colaborativo: ' + error.message);
        document.getElementById('btnCheckout').style.display = 'inline-block';
        document.getElementById('btnCheckin').style.display = 'none';
        contenedor.style.display = 'none';
    }
}

// hacerCheckin se mantiene igual que antes