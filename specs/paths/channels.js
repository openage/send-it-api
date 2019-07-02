module.exports = [{
    url: '/',
    post: {
        'operationId': 'create',
        'description': 'creatng tenats',
        'parameters': [{
            'name': 'body',
            'description': 'channel model for message design',
            'required': true,
            'schema': {
                '$ref': '#/definitions/channelReq'
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
                    '$ref': '#/definitions/channelRes'
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
