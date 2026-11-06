/**
 * TSA SmartWorkforce AI™ — Client API Global & Centralisé
 * Fournit une communication HTTP robuste entre le Frontend et le Backend
 * Compatible Node.js (localhost:3000) et Apache / PHP Hostinger (/api/...)
 */

window.SWA_API = (function() {
    'use strict';

    // Déterminer la racine de l'API de manière dynamique et portable
    // Si la page est servie via http/https, /api pointe directement vers le serveur backend
    const API_BASE = '/api';

    /**
     * Effectue une requête HTTP fetch vers l'API
     */
    async function request(endpoint, options = {}) {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const url = cleanEndpoint.startsWith('/api') ? cleanEndpoint : API_BASE + cleanEndpoint;

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            }
        };

        try {
            const response = await fetch(url, config);
            const contentType = response.headers.get('content-type') || '';

            if (contentType.includes('application/json')) {
                const data = await response.json();
                return data;
            } else {
                const text = await response.text();
                return {
                    success: response.ok,
                    data: text,
                    status: response.status
                };
            }
        } catch (error) {
            console.error(`[SWA API Error] Échec de la requête vers ${url}:`, error);
            throw error;
        }
    }

    return {
        base: API_BASE,
        get: (endpoint, headers = {}) => request(endpoint, { method: 'GET', headers }),
        post: (endpoint, body = {}, headers = {}) => request(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
        put: (endpoint, body = {}, headers = {}) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
        delete: (endpoint, headers = {}) => request(endpoint, { method: 'DELETE', headers }),
        request: request
    };
})();

