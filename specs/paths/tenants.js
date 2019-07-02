module.exports = [{
    url: '/{id}',
    put: { parameters: ['x-role-key'] },
    get: { parameters: ['x-role-key'] }
}, {
    url: '/',
    get: { parameters: ['x-role-key'] }
}]
