module.exports = [{
    'name': 'providerReq',
    'properties': {
        'code': {
            'type': 'string'
        },
        'name': {
            'type': 'string'
        },
        'url': {
            'type': 'string'
        },
        'category': {
            'type': 'string'
        },
        'discoverable': {
            'type': 'boolean'
        },
        'picUrl': {
            'type': 'string'
        },

        'parameters': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'name': {
                        'type': 'string'
                    },
                    'type': {
                        'type': 'string'
                    },
                    'title': {
                        'type': 'string'
                    },
                    'description': {
                        'type': 'string'
                    },
                    'validators': {
                        'type': 'string'
                    },
                    'options': {
                        'type': 'string'
                    }

                }

            }
        }
    }
}]
