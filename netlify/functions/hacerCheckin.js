// Este código se ejecuta en los servidores de Netlify, no en el navegador del cliente
exports.handler = async (event, context) => {
    // 1. Solo permitimos peticiones POST (para enviar datos)
    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: "Método no permitido. Usa POST." }) 
        };
    }

    try {
        // 2. Extraemos los datos que nos enviará tu web más adelante
        const { fileId, usuario, fecha } = JSON.parse(event.body);

        // 3. Leemos la clave de API que guardaste en el panel de Netlify
        const API_KEY = process.env.ONLYOFFICE_API_KEY; 
        
        // ⚠️ RECUERDA CAMBIAR ESTA URL por la de tu propio DocSpace de OnlyOffice
        const DOCSPACE_URL = "https://onlyoffice.com"; 

        // 4. Conectamos con OnlyOffice para guardar el historial
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

        // 5. Si todo sale bien, devolvemos el éxito a tu web
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
