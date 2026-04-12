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
        const DOCSPACE_URL = 'https://docspace-n50o74.onlyoffice.com'; // ⚠️ Cambia por tu URL real
        
        // Generar Excel en memoria (igual que antes)
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
        
        // ID de la sala de destino (debes configurarlo)
        const roomId = '2600999'; // ⚠️ Cámbialo por el ID real
        
        // Asegurar extensión .xlsx
        const nombreFinal = nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`;
        
        // Crear archivo en DocSpace
        const createResponse = await fetch(`${DOCSPACE_URL}/api/2.0/files/${roomId}/file`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: nombreFinal
            })
        });
        
        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('Error al crear archivo en DocSpace:', errorText);
            throw new Error('Error al crear el archivo en DocSpace');
        }
        
        const { response: fileInfo } = await createResponse.json();
        const fileId = fileInfo.id;
        
        // Subir contenido
        const uploadResponse = await fetch(`${DOCSPACE_URL}/api/2.0/files/${fileId}/upload`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/octet-stream'
            },
            body: excelBuffer
        });
        
        if (!uploadResponse.ok) {
            throw new Error('Error al subir el contenido del archivo');
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ fileId })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Error interno del servidor' })
        };
    }
};