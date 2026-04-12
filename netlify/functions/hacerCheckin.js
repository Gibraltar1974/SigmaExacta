// netlify/functions/hacerCheckin.js
exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Método no permitido. Usa POST." })
        };
    }

    try {
        const { fileId, usuario, fecha } = JSON.parse(event.body);
        const API_KEY = process.env.ONLYOFFICE_API_KEY;
        const DOCSPACE_URL = "https://docspace-n50o74.onlyoffice.com"; // ← Cambia por tu URL real

        const urlPeticion = `${DOCSPACE_URL}/api/2.0/files/file/${fileId}/history`;

        const respuestaOnly = await fetch(urlPeticion, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "changes": `Check-in realizado por ${usuario} el ${fecha}`
            })
        });

        if (!respuestaOnly.ok) {
            throw new Error("Error en la respuesta de OnlyOffice");
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "¡Check-in registrado con éxito en OnlyOffice!" })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "No se pudo conectar con OnlyOffice. Revisa la clave o la URL." })
        };
    }
};