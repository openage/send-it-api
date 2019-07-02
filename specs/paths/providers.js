module.exports = [{
    url: '/',
    post: {
        'operationId': 'create',
        'description': 'creatng provider',
        'parameters': [{
            'name': 'body',
            'description': 'provider model for message design',
            'required': true,
            'schema': {
                '$ref': '#/definitions/providerReq'
            }
        }],
        'responses': {
            '200': {
                'description': 'post response succcess',
                'schema': {
                    '$ref': '#/definitions/providerRes'
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
