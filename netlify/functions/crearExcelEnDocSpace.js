// netlify/functions/crearExcelEnDocSpace.js
const XLSX = require('xlsx');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        const { datosInforme, nombreArchivo } = JSON.parse(event.body);
        const API_KEY = process.env.ONLYOFFICE_API_KEY;
        const DOCSPACE_URL = 'https://docspace-n50o74.onlyoffice.com';
        const roomId = '2600999';

        // Generar Excel
        const workbook = XLSX.utils.book_new();
        const wsData = [
            ['PDCA Cycle Report'],
            ['Company: Sigma Exacta'],
            [`Date: ${new Date().toLocaleDateString()}`],
            [],
            ['Phase', 'Category', 'Details'],
            ['PLAN', 'Problem/Opportunity', datosInforme.plan.problem || ''],
            ['', 'Goal/Hypothesis', datosInforme.plan.goal || ''],
            ['', 'Action Plan', datosInforme.plan.actions || ''],
            [],
            ['DO', 'Execution Record', datosInforme.do.execution || ''],
            ['', 'Problems/Observations', datosInforme.do.problems || ''],
            [],
            ['CHECK', 'Data & Results', datosInforme.check.data || ''],
            ['', 'Analysis', datosInforme.check.analysis || ''],
            [],
            ['ACT', 'Conclusions', datosInforme.act.conclusions || ''],
            ['', 'Next Steps', datosInforme.act.next || '']
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(workbook, ws, 'PDCA Report');
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        const nombreFinal = nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`;

        // 1. Crear archivo en DocSpace
        console.log(`Creando archivo en DocSpace: ${nombreFinal}`);
        const createResponse = await fetch(`${DOCSPACE_URL}/api/2.0/files/${roomId}/file`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: nombreFinal })
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('Error al crear archivo:', createResponse.status, errorText);
            throw new Error(`Error al crear archivo (${createResponse.status}): ${errorText}`);
        }

        const createData = await createResponse.json();
        const fileId = createData.response.id;
        console.log(`Archivo creado con ID: ${fileId}`);

        // 2. Obtener URL de edición para subir el contenido
        console.log(`Obteniendo URL de edición para ${fileId}...`);
        const editResponse = await fetch(`${DOCSPACE_URL}/api/2.0/files/file/${fileId}/openedit`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!editResponse.ok) {
            const errorText = await editResponse.text();
            console.error('Error al obtener URL de edición:', editResponse.status, errorText);
            throw new Error(`Error al obtener URL de edición (${editResponse.status})`);
        }

        const editData = await editResponse.json();
        const editUrl = editData.response.urls.edit;

        // 3. Subir el contenido Excel
        console.log(`Subiendo contenido de ${excelBuffer.length} bytes a ${editUrl}...`);
        const uploadResponse = await fetch(editUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/octet-stream'
            },
            body: excelBuffer
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Error al subir contenido:', uploadResponse.status, errorText);
            throw new Error(`Error al subir contenido (${uploadResponse.status}): ${errorText}`);
        }

        console.log('Contenido subido exitosamente');

        return {
            statusCode: 200,
            body: JSON.stringify({ fileId })
        };

    } catch (error) {
        console.error('Error general:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Error interno del servidor' })
        };
    }
};