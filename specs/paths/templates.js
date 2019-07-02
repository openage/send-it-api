module.exports = [{
    url: '/',
    post: {
        'operationId': 'create',
        'description': 'creatng template',
        'parameters': [{
            'name': 'body',
            'description': 'template model for message design',
            'required': true,
            'schema': {
                '$ref': '#/definitions/templateReq'
            }
        }, {
            'name': 'x-access-token',
            'in': 'header',
            'description': 'user token',
            'required': false,
            'type': 'string'
        }, {
            'name': 'x-role-key',
            'in': 'header',
            'description': 'ED role key to be passed as a header',
            'required': false,
            'type': 'string'
        }],
        'responses': {
            '200': {
                'description': 'post response succcess',
                'schema': {
                    '$ref': '#/definitions/templateRes'
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
