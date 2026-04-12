let docEditor;
let currentFileId = null;

async function hacerCheckout() {
    // Verificar que hay datos del informe
    if (!window.cycleData || Object.keys(window.cycleData).length === 0) {
        alert("Primero debes generar el informe PDCA.");
        return;
    }

    // Pedir nombre del archivo al usuario
    let nombreArchivo = prompt("Introduce un nombre para el archivo Excel (sin extensión):", "Informe_PDCA");
    if (!nombreArchivo) {
        nombreArchivo = `PDCA_Report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    } else {
        nombreArchivo = nombreArchivo.replace(/[\\/:*?"<>|]/g, '_'); // Limpiar caracteres inválidos
    }

    // Cambiar botones
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

async function hacerCheckin() {
    if (!currentFileId) {
        alert("No hay ningún archivo abierto.");
        return;
    }

    const usuario = "Usuario SigmaExacta"; // Puedes personalizarlo
    const fecha = new Date().toLocaleString();

    try {
        const respuesta = await fetch('/.netlify/functions/hacerCheckin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId: currentFileId, usuario, fecha })
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            alert(resultado.message);
        } else {
            alert("Error: " + resultado.error);
        }
    } catch (error) {
        alert("No se pudo conectar con el backend.");
    }

    // Limpiar editor y restaurar botones
    document.getElementById('contenedorOnlyOffice').innerHTML = "";
    document.getElementById('contenedorOnlyOffice').style.display = 'none';
    document.getElementById('btnCheckout').style.display = 'inline-block';
    document.getElementById('btnCheckin').style.display = 'none';
    currentFileId = null;
}