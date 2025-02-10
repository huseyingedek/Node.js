import swaggerJsdoc from 'swagger-jsdoc';
import { authDocs } from '../docs/auth.docs';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User Authentication API',
            version: '1.0.0',
            description: 'User Authentication API Documentation'
        },
        servers: [
            {
                url: 'http://localhost:5000'
            }
        ],
        tags: [authDocs.tags],
        paths: {
            ...authDocs.paths
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: []
};

export const specs = swaggerJsdoc(options);