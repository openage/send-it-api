module.exports = [{
    'name': 'userReq',
    'properties': {
        'name': {
            'type': 'string'
        },
        'code': {
            'type': 'string'
        },
        'phone': {
            'type': 'string'
        },
        'email': {
            'type': 'string'
        },
        'otp': {
            'type': 'string'
        },
        'chat': {
            'type': 'object',
            'properties': {
                'id': {
                    'type': 'string'
                },
                'key': {
                    'type': 'string'
                },
                'statusMessage': {
                    'type': 'string'
                }
            }
        },
        'devices': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'id': {
                        'type': 'string'
                    },
                    'name': {
                        'type': 'string'
                    },
                    'status': {
                        'type': 'string'
                    }
                }
            }
        },
        'notifications': {
            'type': 'object',
            'properties': {
                'enabled': {
                    'type': 'string'
                },
                'snooze': {
                    'type': 'string'
                },
                'refusals': {
                    'type': 'array',
                    'items': {
                        'type': 'string'
                    }
                }
            }
        },
        'status': {
            'type': 'string'
        }
    }
}]
