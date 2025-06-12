const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Property Rental API',
            version: '1.0.0',
            description: 'A comprehensive API for property rental platform.',
            contact: {
                name: 'API Support',
                email: 'support@propertyrent.com'
            }
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://vizima-backend.onrender.com/api'
                    : 'http://localhost:5000/api',
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'admin'] },
                        avatar: { type: 'string' },
                        isVerified: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Property: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        type: { type: 'string', enum: ['apartment', 'house', 'room', 'studio'] },
                        price: { type: 'number' },
                        location: {
                            type: 'object',
                            properties: {
                                address: { type: 'string' },
                                city: { type: 'string' },
                                state: { type: 'string' },
                                zipCode: { type: 'string' },
                                coordinates: {
                                    type: 'object',
                                    properties: {
                                        lat: { type: 'number' },
                                        lng: { type: 'number' }
                                    }
                                }
                            }
                        },
                        amenities: { type: 'array', items: { type: 'string' } },
                        images: { type: 'array', items: { type: 'string' } },
                        bedrooms: { type: 'number' },
                        bathrooms: { type: 'number' },
                        area: { type: 'number' },
                        isAvailable: { type: 'boolean' },
                        owner: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Booking: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        property: { type: 'string' },
                        user: { type: 'string' },
                        checkIn: { type: 'string', format: 'date' },
                        checkOut: { type: 'string', format: 'date' },
                        totalAmount: { type: 'number' },
                        status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
                        paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed', 'refunded'] },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Banner: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        image: { type: 'string' },
                        link: { type: 'string' },
                        isActive: { type: 'boolean' },
                        order: { type: 'number' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        errors: { type: 'array', items: { type: 'string' } }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./routes/*.js', './controllers/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);
module.exports = specs;