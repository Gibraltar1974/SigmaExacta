const XLSX = require('xlsx');
const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
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
        const createResponse = await axios.post(
            `${DOCSPACE_URL}/api/2.0/files/${roomId}/file`,
            { title: nombreFinal },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const fileId = createResponse.data.response.id;
        console.log(`File created, ID: ${fileId}`);

        // 2. Subir contenido usando multipart/form-data con axios
        const form = new FormData();
        // Convertir buffer a stream legible
        const stream = Readable.from(excelBuffer);
        form.append('file', stream, {
            filename: nombreFinal,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            knownLength: excelBuffer.length
        });

        console.log(`Uploading content via axios...`);
        const uploadResponse = await axios.post(
            `${DOCSPACE_URL}/api/2.0/files/${fileId}/upload`,
            form,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    ...form.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log('Upload successful');

        return {
            statusCode: 200,
            body: JSON.stringify({ fileId })
        };

    } catch (error) {
        console.error('Function error:', error);
        const errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage })
        };
    }
};