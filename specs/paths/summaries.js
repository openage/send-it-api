module.exports = [{
    url: '/{id}',
    get: {
        parameters: [{
            name: 'id',
            in: 'path',
            description: 'employee id here',
            required: true
        }, {
            name: 'x-role-key',
            in: 'header',
            description: 'token',
            required: true
        }],
        responses: {
            default: {
                description: 'Unexpected error',
                schema: {
                    '$ref': '#/definitions/summaryRes'
                }
            }
        }
    }
}]
