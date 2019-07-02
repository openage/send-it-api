module.exports = [{
    url: '/',
    get: {
        'operationId': 'get',
        'description': 'get all users',
        'parameters': [{
            'name': 'x-role-key',
            'in': 'header',
            'description': 'role to be passed in headers',
            'required': true,
            'type': 'string'
        }],
        'responses': {
            '200': {
                'description': 'post response succcess',
                'schema': {
                    '$ref': '#/definitions/userRes'
                }
            }
        },
        'default': {
            'description': 'post response succcess',
            'schema': {
                '$ref': '#/definitions/errorResponse'
            }
        }
    }
}, {
    url: '/bulk',
    post: {
        'operationId': 'update',
        'description': 'update user in bulk',
        'parameters': [{
            'name': 'items',
            'in': 'body',
            'schema': {
                '$ref': '#/definitions/userBulkReq'
            }
        }],
        'responses': {
            '200': {
                'description': 'post response success'
            }
        },
        'default': {
            'description': 'post response succcess',
            'schema': {
                '$ref': '#/definitions/errorResponse'
            }
        }
    }
}, {
    url: '/{id}',
    put: {
        'operationId': 'update',
        'description': 'update user',
        'parameters': [{
            'name': 'create',
            'in': 'body',
            'description': 'subscribe to a service by posting data in body',
            'schema': {
                '$ref': '#/definitions/userReq'
            }
        }, {
            'name': 'id',
            'in': 'path',
            'description': 'set my to get of its own',
            'required': true,
            'type': 'string'
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'role to be passed in headers',
            'required': true,
            'type': 'string'
        }],
        'responses': {
            '200': {
                'description': 'post response success',
                'schema': {
                    '$ref': '#/definitions/userRes'
                }
            }
        },
        'default': {
            'description': 'post response succcess',
            'schema': {
                '$ref': '#/definitions/errorResponse'
            }
        }
    },
    get: {
        'operationId': 'update',
        'description': 'update user',
        'parameters': [{
            'name': 'id',
            'in': 'path',
            'description': 'set my to get of its own',
            'required': true,
            'type': 'string'
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'role to be passed in headers',
            'required': true,
            'type': 'string'
        }],
        'responses': {
            '200': {
                'description': 'post response succcess',
                'schema': {
                    '$ref': '#/definitions/userRes'
                }
            }
        },
        'default': {
            'description': 'post response succcess',
            'schema': {
                '$ref': '#/definitions/errorResponse'
            }
        }
    }
}]
