module.exports = [{
    'name': 'userBulkReq',
    'properties': {
        'items': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
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
                    'role': {
                        'type': 'object',
                        'properties': {
                            'key': {
                                'type': 'string'
                            }
                        }

                    }
                }
            }

        }
    }
}]
