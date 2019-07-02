module.exports = [{
    'name': 'userRes',
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
        'token': {
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
                'subscriptions': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'key': {
                                'type': 'string'
                            },
                            'value': {
                                'type': 'boolean'
                            },
                            'snooze': {
                                'type': 'string'
                            }
                        }
                    }
                }
            }
        },
        'status': {
            'type': 'string'
        },
        'organization': {
            'type': 'string'
        },
        'tenant': {
            'type': 'string'
        }
    }
}]
