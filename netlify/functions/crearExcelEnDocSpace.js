// netlify/functions/crearExcelEnDocSpace.js
const XLSX = require('xlsx');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { datosInforme, nombreArchivo } = JSON.parse(event.body);
        const API_KEY = process.env.ONLYOFFICE_API_KEY;
        const DOCSPACE_URL = 'https://docspace-n50o74.onlyoffice.com';
        const roomId = '2600999';

        if (!API_KEY) throw new Error('ONLYOFFICE_API_KEY not configured');

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
        console.log(`Creating file: ${nombreFinal}`);
        const createResponse = await fetch(`${DOCSPACE_URL}/api/2.0/files/${roomId}/file`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: nombreFinal })
        });

        if (!createResponse.ok) {
            const err = await createResponse.text();
            throw new Error(`Create file failed (${createResponse.status}): ${err}`);
        }

        const createData = await createResponse.json();
        const fileId = createData.response.id;
        console.log(`File created, ID: ${fileId}`);

        // 2. Guardar contenido usando PUT con Base64 en JSON
        const base64Content = excelBuffer.toString('base64');
        console.log(`Saving content as Base64 (length: ${base64Content.length})...`);

        const saveResponse = await fetch(`${DOCSPACE_URL}/api/2.0/files/file/${fileId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: base64Content,
                contentEncoding: 'base64'
            })
        });

        if (!saveResponse.ok) {
            const err = await saveResponse.text();
            throw new Error(`Save content failed (${saveResponse.status}): ${err}`);
        }

        console.log('Content saved successfully');

        return {
            statusCode: 200,
            body: JSON.stringify({ fileId })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};