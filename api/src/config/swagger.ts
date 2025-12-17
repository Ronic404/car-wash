import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Wash API',
      version: '1.0.0',
      description: 'API для приложения автомойки',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'API сервер',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

