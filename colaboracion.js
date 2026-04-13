// colaboracion.js - Versión final para modo Room
let currentFileId = null;

window.hacerCheckout = async function () {
    if (!window.cycleData || Object.keys(window.cycleData).length === 0) {
        alert("Primero debes generar el informe PDCA.");
        return;
    }

    let nombreArchivo = prompt("Introduce un nombre para el archivo Excel (sin extensión):", "Informe_PDCA");
    if (!nombreArchivo) {
        nombreArchivo = `PDCA_Report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    } else {
        nombreArchivo = nombreArchivo.replace(/[\\/:*?"<>|]/g, '_');
    }

    const btnCheckout = document.getElementById('btnCheckout');
    const btnCheckin = document.getElementById('btnCheckin');
    const contenedor = document.getElementById('contenedorOnlyOffice');

    if (btnCheckout) btnCheckout.style.display = 'none';
    if (btnCheckin) btnCheckin.style.display = 'inline-block';
    if (contenedor) {
        contenedor.style.display = 'block';
        contenedor.innerHTML = '<p style="text-align:center; padding-top:200px;">Creando archivo en la nube...</p>';
    }

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

        const data = await respuesta.json();
        currentFileId = data.fileId;

        // El SDK ya está cargado con la sala; solo limpiamos el contenedor y mostramos la sala
        contenedor.innerHTML = ''; // El SDK reemplazará el contenido

    } catch (error) {
        alert('No se pudo crear el archivo colaborativo: ' + error.message);
        if (btnCheckout) btnCheckout.style.display = 'inline-block';
        if (btnCheckin) btnCheckin.style.display = 'none';
        if (contenedor) contenedor.style.display = 'none';
    }
};

window.hacerCheckin = async function () {
    if (!currentFileId) {
        alert("No hay ningún archivo abierto.");
        return;
    }

    const usuario = "Usuario SigmaExacta";
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

    const contenedor = document.getElementById('contenedorOnlyOffice');
    if (contenedor) {
        contenedor.innerHTML = "";
        contenedor.style.display = 'none';
    }
    const btnCheckout = document.getElementById('btnCheckout');
    const btnCheckin = document.getElementById('btnCheckin');
    if (btnCheckout) btnCheckout.style.display = 'inline-block';
    if (btnCheckin) btnCheckin.style.display = 'none';

    currentFileId = null;
};