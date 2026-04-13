// colaboracion.js - Versión final para modo Editor
let docEditor = null;
let currentFileId = null;

window.hacerCheckout = async function () {
    // Verificar que hay datos del informe
    if (!window.cycleData || Object.keys(window.cycleData).length === 0) {
        alert("Primero debes generar el informe PDCA.");
        return;
    }

    // Pedir nombre del archivo
    let nombreArchivo = prompt("Introduce un nombre para el archivo Excel (sin extensión):", "Informe_PDCA");
    if (!nombreArchivo) {
        nombreArchivo = `PDCA_Report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    } else {
        nombreArchivo = nombreArchivo.replace(/[\\/:*?"<>|]/g, '_');
    }

    // Cambiar botones
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
        // Llamar a la función de Netlify que crea el Excel en DocSpace
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

        // Inicializar el editor en modo Editor
        if (typeof DocsAPI === 'undefined') {
            throw new Error('SDK de OnlyOffice no disponible. Asegúrate de haber configurado el modo Editor en el panel de DocSpace.');
        }

        const config = {
            document: {
                fileType: 'xlsx',
                key: currentFileId,          // ID del archivo recién creado
                title: nombreArchivo + '.xlsx',
                url: 'https://docspace-n50o74.onlyoffice.com/' // URL base de tu DocSpace
            },
            documentType: 'cell',
            editorConfig: {
                mode: 'edit',
                user: {
                    id: 'guest',
                    name: 'Usuario SigmaExacta'
                }
            },
            height: '500px',
            width: '100%'
        };

        docEditor = new DocsAPI.DocEditor('contenedorOnlyOffice', config);

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

    // Limpiar editor y restaurar botones
    const contenedor = document.getElementById('contenedorOnlyOffice');
    if (contenedor) {
        contenedor.innerHTML = "";
        contenedor.style.display = 'none';
    }
    const btnCheckout = document.getElementById('btnCheckout');
    const btnCheckin = document.getElementById('btnCheckin');
    if (btnCheckout) btnCheckout.style.display = 'inline-block';
    if (btnCheckin) btnCheckin.style.display = 'none';

    if (docEditor) {
        docEditor.destroyEditor();
        docEditor = null;
    }
    currentFileId = null;
};