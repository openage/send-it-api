module.exports = [{
    'name': 'clientReq',
    'properties': {
        'code': {
            'type': 'string'
        },
        'name': {
            'type': 'string'
        },
        'channels': {
            'type': 'object',
            'properties': {
                'sms': {
                    'type': 'string'
                },
                'email': {
                    'type': 'string'
                },
                'push': {
                    'type': 'string'
                },
                'chat': {
                    'type': 'string'
                }
            }
        },
        'status': {
            'type': 'string'
        },
        'config': {
            'type': 'object'
        }
    }
}]
