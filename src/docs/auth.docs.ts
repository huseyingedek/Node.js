export const authDocs = {
    tags: {
        name: 'Auth',
        description: 'Authentication endpoints'
    },
    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    firstName: {
                                        type: 'string'
                                    },
                                    lastName: {
                                        type: 'string'
                                    },
                                    number: {
                                        type: 'string'
                                    },
                                    email: {
                                        type: 'string'
                                    },
                                    password: {
                                        type: 'string'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Success'
                    }
                }
            }
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: {
                                        type: 'string'
                                    },
                                    password: {
                                        type: 'string'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Success'
                    }
                }
            }
        },
        '/api/auth/profile': {
            get: {
                tags: ['Auth'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Success'
                    }
                }
            }
        }
    }
};