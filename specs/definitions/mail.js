module.exports = {
    'required': [
        'job'
    ],
    'type': 'object',
    'properties': {
        'job': {
            'required': 'id',
            'type': 'object',
            'properties': {
                'id': {
                    'type': 'integer'
                }
            }
        },
        'data': {
            'type': 'object',
            'properties': {
                'type': 'object',
                'template': {
                    'type': 'object',
                    'properties': {
                        'type': 'object',
                        'id': {
                            'type': 'string'
                        },
                        'code': {
                            'type': 'string'
                        }
                    }
                },
                'organization': {
                    'type': 'object',
                    'properties': {
                        'type': 'object',
                        'id': {
                            'type': 'string'
                        },
                        'code': {
                            'type': 'string'
                        },
                        'name': {
                            'type': 'string'
                        }
                    }
                },
                'data': {
                    'type': 'object',
                    'properties': {
                        'email': {
                            'type': 'string'
                        }
                    }
                }
            }
        }
    }
}
